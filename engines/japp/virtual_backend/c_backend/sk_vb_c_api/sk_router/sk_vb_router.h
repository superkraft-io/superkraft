#pragma once

class SK_VirtualBackend;

class SK_VB_Router {
public:
	SK_VirtualBackend* vbe;

    SK_VB_Router(SK_VirtualBackend *_vbe);
	~SK_VB_Router();
    
    
    auto lookUpResource(const juce::String& url, const juce::String& viewID = "") -> std::optional<juce::WebBrowserComponent::Resource>;
    
    auto loadResourceFrom_Disk(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;


    auto loadResourceFrom_BinaryData(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource>;


    auto handle_native_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource>;


};
