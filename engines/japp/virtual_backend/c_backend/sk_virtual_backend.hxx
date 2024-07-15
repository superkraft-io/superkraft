#pragma once

#include <JuceHeader.h>
#include <juce_gui_extra/juce_gui_extra.h>


//#include "ssc/ssc_wrapper.h"
//#include "ssc/core/json.hh"

//using namespace SSC;


#include "sk_vb_c_api/sk_vb_c_api.h"

class SK_VirtualBackend : public juce::WebBrowserComponent {
public:
    using juce::WebBrowserComponent::WebBrowserComponent;


    //SSC_Wrapper ssc_wrapper;

    SK_C_API* sk_c_api = new SK_C_API(this);

    void propagateThisPointer(SK_VirtualBackend* thisPtr);

    auto pageAboutToLoad(const juce::String& newUrl) -> bool override;

    auto createResource(const juce::String& resourceName) -> juce::WebBrowserComponent::Resource;

    auto lookUpMimeType(const juce::String& filename, const juce::String& defaultMimeType = "application/octet-stream") -> juce::String;


    bool is_IPC_command(juce::String url);
    auto handle_IPC_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource>;

    auto lookUpResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;
    auto SK_VirtualBackend::loadResourceFrom_Disk(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;
    auto SK_VirtualBackend::loadResourceFrom_BinaryData(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;

    void SK_VirtualBackend::handle_sk_ipc_msg(const var& object) {
        juce::DynamicObject* obj = object.getDynamicObject();

        juce::String target = obj->getProperty("target");
        juce::int64 msgIdx = obj->getProperty("msgIdx");
        juce::String cmd = obj->getProperty("cmd");

        if (target == "sk_c_be") {
            sk_c_api->ipc->handle_Native_IPC_Msg(msgIdx, cmd, obj);
        }

        if (target == "sk_view") {
            juce::String dataAsJSON = obj->getProperty("data"); //data to be forwarded to a view as a stringified JSON
            //check if message requires a callback
            //find the view to send the data to
            //send the view web context
            //send the data
        }


    };



    //auto SK_VirtualBackend::createJSONResponse(SSC::JSON::Object json) -> std::optional<juce::WebBrowserComponent::Resource>;

    // clang-format off
    std::unordered_map<juce::String, juce::String> s_mimeTypes{
        {"aac", "audio/aac"},
        {"aif", "audio/aiff"},
        {"aiff", "audio/aiff"},
        {"avif", "image/avif"},
        {"bmp", "image/bmp"},
        {"css", "text/css"},
        {"csv", "text/csv"},
        {"flac", "audio/flac"},
        {"gif", "image/gif"},
        {"htm", "text/html"},
        {"html", "text/html"},
        {"ico", "image/vnd.microsoft.icon"},
        {"jpeg", "image/jpeg"},
        {"jpg", "image/jpeg"},
        {"js", "text/javascript"},
        {"json", "application/json"},
        {"md", "text/markdown"},
        {"mid", "audio/midi"},
        {"midi", "audio/midi"},
        {"mjs", "text/javascript"},
        {"mp3", "audio/mpeg"},
        {"mp4", "video/mp4"},
        {"mpeg", "video/mpeg"},
        {"ogg", "audio/ogg"},
        {"otf", "font/otf"},
        {"pdf", "application/pdf"},
        {"png", "image/png"},
        {"rtf", "application/rtf"},
        {"svg", "image/svg+xml"},
        {"svgz", "image/svg+xml"},
        {"tif", "image/tiff"},
        {"tiff", "image/tiff"},
        {"ttf", "font/ttf"},
        {"txt", "text/plain"},
        {"wasm", "application/wasm"},
        {"wav", "audio/wav"},
        {"weba", "audio/webm"},
        {"webm", "video/webm"},
        {"webp", "image/webp"},
        {"woff", "font/woff"},
        {"woff2", "font/woff2"},
        {"xml", "application/xml"},
        {"zip", "application/zip"},
    };
    // clang-format on


    std::unordered_map<juce::String, juce::WebBrowserComponent::Resource> s_resources{
        {"/virtual_backend/api/application/menu.js", createResource("menu_js")},
        {"/virtual_backend/api/application.js", createResource("application_js")}
    };


};
