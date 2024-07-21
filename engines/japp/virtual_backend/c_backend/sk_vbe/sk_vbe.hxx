#pragma once

#include <JuceHeader.h>
#include <juce_gui_extra/juce_gui_extra.h>


#include "../sk_vb_c_api/sk_vb_c_api.h"

class SK_VirtualBackend : public juce::WebBrowserComponent {
public:
    using juce::WebBrowserComponent::WebBrowserComponent;

    SK_C_API* sk_c_api = new SK_C_API(this);

    auto pageAboutToLoad(const juce::String& newUrl) -> bool override;

    auto createResource(const juce::String& resourceName) -> juce::WebBrowserComponent::Resource;

    auto lookUpMimeType(const juce::String& filename, const juce::String& defaultMimeType = "application/octet-stream") -> juce::String;


    auto handle_native_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource>;

    auto lookUpResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;
    auto SK_VirtualBackend::loadResourceFrom_Disk(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;
    auto SK_VirtualBackend::loadResourceFrom_BinaryData(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;

    void SK_VirtualBackend::handle_sk_ipc_msg(const var& object) {
        juce::DynamicObject* obj = object.getDynamicObject();

        sk_c_api->ipc->handle_IPC_Msg(obj);
    };

    void SK_VirtualBackend::handle_ipc_msg_from_view(const String& sk_ipc_msg);



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
