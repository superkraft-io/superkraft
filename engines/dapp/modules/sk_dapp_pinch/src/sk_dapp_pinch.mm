// sk_dapp_pinch: trackpad finger positions during pinch gestures (macOS).
//
// Chromium turns a trackpad pinch into ctrl+wheel with only a scale delta, so
// the page cannot tell horizontal from vertical. This watches attached windows'
// magnify / gesture events and reports each touching finger's normalized
// trackpad position. Magnify events carry no touches; the NSEventTypeGesture
// events that accompany them do. Pairing and axis logic live in JS.

#import <AppKit/AppKit.h>
#include <node_api.h>
#include <vector>

namespace {

struct Touch {
    double x;
    double y;
};

struct Sample {
    int windowId;
    int type;            // NSEventType
    int phase;           // NSEventPhase (magnify only, else 0)
    double magnification;
    double deviceWidth;  // trackpad size in points (1/72 in)
    double deviceHeight;
    std::vector<Touch> touches;
};

napi_threadsafe_function g_tsfn = nullptr;
id g_monitor = nil;
NSMapTable<NSWindow *, NSNumber *> *g_windows = nil;
int g_nextWindowId = 1;

void enableTouches(NSView *view){
    if (!view) return;
    view.allowedTouchTypes = NSTouchTypeMaskIndirect;
    for (NSView *sub in view.subviews) enableTouches(sub);
}

void setNumber(napi_env env, napi_value obj, const char *key, double value){
    napi_value v;
    napi_create_double(env, value, &v);
    napi_set_named_property(env, obj, key, v);
}

void callJs(napi_env env, napi_value jsCb, void *, void *data){
    Sample *sample = static_cast<Sample *>(data);
    if (env && jsCb) {
        napi_value obj;
        napi_create_object(env, &obj);
        setNumber(env, obj, "windowId", sample->windowId);
        setNumber(env, obj, "type", sample->type);
        setNumber(env, obj, "phase", sample->phase);
        setNumber(env, obj, "magnification", sample->magnification);
        setNumber(env, obj, "deviceWidth", sample->deviceWidth);
        setNumber(env, obj, "deviceHeight", sample->deviceHeight);

        napi_value arr;
        napi_create_array_with_length(env, sample->touches.size(), &arr);
        for (size_t i = 0; i < sample->touches.size(); i++) {
            napi_value t;
            napi_create_object(env, &t);
            setNumber(env, t, "x", sample->touches[i].x);
            setNumber(env, t, "y", sample->touches[i].y);
            napi_set_element(env, arr, (uint32_t)i, t);
        }
        napi_set_named_property(env, obj, "touches", arr);

        napi_value undef;
        napi_get_undefined(env, &undef);
        napi_call_function(env, undef, jsCb, 1, &obj, nullptr);
    }
    delete sample;
}

void emit(NSEvent *event, int windowId){
    if (!g_tsfn) return;
    Sample *sample = new Sample();
    sample->windowId = windowId;
    sample->type = (int)event.type;
    sample->phase = event.type == NSEventTypeMagnify ? (int)event.phase : 0;
    sample->magnification = event.type == NSEventTypeMagnify ? event.magnification : 0;
    sample->deviceWidth = 0;
    sample->deviceHeight = 0;

    NSSet<NSTouch *> *touches = nil;
    @try {
        touches = [event touchesMatchingPhase:NSTouchPhaseTouching inView:nil];
    } @catch (NSException *) {
        touches = nil;
    }
    for (NSTouch *touch in touches) {
        if (touch.type != NSTouchTypeIndirect) continue;
        NSPoint p = touch.normalizedPosition;
        NSSize size = touch.deviceSize;
        sample->deviceWidth = size.width;
        sample->deviceHeight = size.height;
        sample->touches.push_back({p.x, p.y});
    }

    if (napi_call_threadsafe_function(g_tsfn, sample, napi_tsfn_nonblocking) != napi_ok) delete sample;
}

void ensureMonitor(){
    if (g_monitor) return;
    NSEventMask mask = NSEventMaskMagnify | NSEventMaskGesture;
    g_monitor = [NSEvent addLocalMonitorForEventsMatchingMask:mask handler:^NSEvent *(NSEvent *event){
        NSNumber *windowId = event.window ? [g_windows objectForKey:event.window] : nil;
        if (windowId) {
            // Chromium can add subviews after attach; re-opt them in at gesture start.
            if (event.type == NSEventTypeMagnify && event.phase == NSEventPhaseBegan) {
                enableTouches(event.window.contentView);
            }
            emit(event, windowId.intValue);
        }
        return event;
    }];
}

// init(callback): register the JS sink for pinch samples.
napi_value Init(napi_env env, napi_callback_info info){
    size_t argc = 1;
    napi_value argv[1];
    napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
    if (argc < 1) {
        napi_throw_type_error(env, nullptr, "init(callback) requires a function");
        return nullptr;
    }
    if (g_tsfn) {
        napi_release_threadsafe_function(g_tsfn, napi_tsfn_release);
        g_tsfn = nullptr;
    }
    napi_value name;
    napi_create_string_utf8(env, "sk_dapp_pinch", NAPI_AUTO_LENGTH, &name);
    if (napi_create_threadsafe_function(env, argv[0], nullptr, name, 0, 1, nullptr, nullptr, nullptr, callJs, &g_tsfn) != napi_ok) {
        napi_throw_error(env, nullptr, "Failed to create threadsafe function");
        return nullptr;
    }
    // Don't keep the process alive just for this.
    napi_unref_threadsafe_function(env, g_tsfn);
    if (!g_windows) g_windows = [NSMapTable weakToStrongObjectsMapTable];
    ensureMonitor();
    return nullptr;
}

// attach(handle): handle is BrowserWindow.getNativeWindowHandle() (an NSView*).
// Returns a window id (> 0) that tags this window's samples, or 0 on failure.
napi_value Attach(napi_env env, napi_callback_info info){
    size_t argc = 1;
    napi_value argv[1];
    napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
    void *data = nullptr;
    size_t length = 0;
    if (argc < 1 || napi_get_buffer_info(env, argv[0], &data, &length) != napi_ok || length < sizeof(void *)) {
        napi_throw_type_error(env, nullptr, "attach(handle) requires a native window handle buffer");
        return nullptr;
    }
    NSView *view = (__bridge NSView *)(*(void **)data);
    int windowId = 0;
    if (view && view.window) {
        if (!g_windows) g_windows = [NSMapTable weakToStrongObjectsMapTable];
        NSNumber *existing = [g_windows objectForKey:view.window];
        windowId = existing ? existing.intValue : g_nextWindowId++;
        [g_windows setObject:@(windowId) forKey:view.window];
        enableTouches(view.window.contentView);
    }
    napi_value result;
    napi_create_int32(env, windowId, &result);
    return result;
}

napi_value Module(napi_env env, napi_value exports){
    napi_property_descriptor props[] = {
        {"init", nullptr, Init, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"attach", nullptr, Attach, nullptr, nullptr, nullptr, napi_default, nullptr},
    };
    napi_define_properties(env, exports, 2, props);
    return exports;
}

}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Module)
