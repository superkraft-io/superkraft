#pragma once
#include <JuceHeader.h>
#include <filesystem>


class SK_VB_Helpers_MimeTypes {
public:
    static auto lookUpMimeType(const juce::String& filename, const juce::String& defaultMimeType = "text/html") -> juce::String {
        juce::String substr = defaultMimeType;

        auto step1 = std::filesystem::path(filename.toStdString());
        auto step2 = step1.extension();
        auto step3 = step2.string();

        if (step3.empty() == true) return defaultMimeType;
        else substr = step3.substr(1);



        if (auto iterator{ mimeTypes.find(substr) };
            iterator != mimeTypes.end())
        {
            return iterator->second;
        }

        else
        {
            return defaultMimeType;
        }
    };

    static inline std::unordered_map<juce::String, juce::String> mimeTypes {
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
