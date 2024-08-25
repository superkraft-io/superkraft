#pragma once
#include <JuceHeader.h>

class SK_VB_Helpers_WebResource {
public:
    static juce::WebBrowserComponent::Resource JSON2Resource(String jsonStr) {
        juce::WebBrowserComponent::Resource resource;

        std::string data = jsonStr.toStdString().c_str();

        resource.data.resize(data.length());

        std::memcpy(resource.data.data(), data.c_str(), data.length());

        resource.mimeType = "application/json";

        return resource;
    }
};
