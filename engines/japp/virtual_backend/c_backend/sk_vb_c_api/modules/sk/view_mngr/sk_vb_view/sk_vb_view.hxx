#pragma once

#include <JuceHeader.h>
#include <juce_gui_extra/juce_gui_extra.h>

#include "../../../../../libs/ssc/json.hh"

class SK_VirtualBackend;

class SK_VB_ViewMngr_View : public juce::WebBrowserComponent {
public:
    using juce::WebBrowserComponent::WebBrowserComponent;

    SK_VirtualBackend* vbe;

    String id;

    auto pageAboutToLoad(const juce::String& newUrl) -> bool override;

    auto handle_native_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource>;

    void handle_ipc_msg(const var& object);
};
