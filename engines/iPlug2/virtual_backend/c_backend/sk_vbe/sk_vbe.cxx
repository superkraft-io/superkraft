#include "sk_vbe.hxx"
#include "BinaryData.h"

#include <filesystem>
#include <stdio.h>

auto SK_VirtualBackend::pageAboutToLoad(const juce::String& newUrl) -> bool
{
    return newUrl == juce::WebBrowserComponent::getResourceProviderRoot();
}

auto SK_VirtualBackend::createResource(const juce::String& resourceName) -> juce::WebBrowserComponent::Resource {
    juce::WebBrowserComponent::Resource resource;

    int dataSize{};
    auto namedResource{BinaryData::getNamedResource(resourceName.toUTF8(), dataSize)};

    resource.data.resize(dataSize);
    std::memcpy(resource.data.data(), namedResource, dataSize);

    resource.mimeType = SK_VB_Helpers_MimeTypes::lookUpMimeType(BinaryData::getNamedResourceOriginalFilename(resourceName.toUTF8()));

    return resource;
}





void SK_VirtualBackend::handle_ipc_msg_from_view(const String& sk_ipc_msg) {
    emitEventIfBrowserIsVisible("sk.ipc.event", sk_ipc_msg);
};
