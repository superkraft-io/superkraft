#pragma once

#include <JuceHeader.h>
#include <juce_gui_extra/juce_gui_extra.h>

#include "../../../../libs/ssc/json.hh"

class SK_VirtualBackend;

class SK_VB_ViewMngr_View : public juce::WebBrowserComponent {
public:
    using juce::WebBrowserComponent::WebBrowserComponent;

    SK_VirtualBackend* vbe;

    String id;

    auto SK_VB_ViewMngr_View::pageAboutToLoad(const juce::String& newUrl) -> bool override;

    auto SK_VB_ViewMngr_View::createResource_2(const juce::String& resourceName) -> juce::WebBrowserComponent::Resource;

    auto SK_VB_ViewMngr_View::lookUpMimeType(const juce::String& filename, const juce::String& defaultMimeType = "application/octet-stream") -> juce::String;

    auto SK_VB_ViewMngr_View::handle_native_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource>;

    auto SK_VB_ViewMngr_View::lookUpResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;
    auto SK_VB_ViewMngr_View::loadResourceFrom_Disk(const juce::String& url)->std::optional<juce::WebBrowserComponent::Resource>;
    auto SK_VB_ViewMngr_View::loadResourceFrom_BinaryData(const juce::String& url)->std::optional<juce::WebBrowserComponent::Resource>;

    void SK_VB_ViewMngr_View::handle_ipc_msg(const var& object);



    // clang-format off
    SSC::JSON::Object s_mimeTypes = SSC::JSON::Object::Entries{
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

};
