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



auto SK_VirtualBackend::lookUpResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource> {
    const auto requestedUrl{ url == "/" ? juce::String{"/superkraft/engines/japp/virtual_backend/web_frontend/sk_vb.html"} : url };

    auto nativeCommandResponse = handle_native_command(url);
    if (nativeCommandResponse != std::nullopt) return nativeCommandResponse;

    const bool loadFromDisk = false;

    if (mode == "debug" && loadFromDisk == true) {
        auto res = loadResourceFrom_Disk(requestedUrl);
        return res;
    } else {
        auto res = loadResourceFrom_BinaryData(requestedUrl);
        return res;
    }
}


auto SK_VirtualBackend::loadResourceFrom_Disk(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource> {


    juce::WebBrowserComponent::Resource* resource = new Resource();
    auto filename = std::filesystem::path(url.toStdString()).filename().string();
    resource->mimeType = SK_VB_Helpers_MimeTypes::lookUpMimeType(filename);

    if (url.indexOf("sk_vfs:") > -1) {
        String fixedURL = url;
        if (fixedURL.substring(0, 1) == "/") fixedURL = fixedURL.substring(1, fixedURL.length());
        
        SK_VB_VFS_File* file = sk_c_api->sk->vfs->findByPath(fixedURL);
        std::string path = String(file->path).toStdString();
        String dataStr = String(file->data);
        std::string data = dataStr.toStdString();
        size_t fileSize = dataStr.length();
        resource->data.resize(fileSize);

        const char* dataPtr = data.c_str();
        std::memcpy(resource->data.data(), dataPtr, fileSize);


        return *resource;
    }
    
    juce::String targetPath = SK_FS::getProjectPath() + "/assets" + url;

    FILE* file = fopen(targetPath.toStdString().c_str(), "rb");
    if (file)
    {
        fseek(file, 0, SEEK_END);
        long dataSize = ftell(file);
        char* buffer = (char*)malloc(dataSize + 1);
        fseek(file, 0, SEEK_SET);
        fread(buffer, 1, dataSize, file);


        resource->data.resize(dataSize);
        std::memcpy(resource->data.data(), buffer, dataSize);

        free(buffer);

        fclose(file);


        return *resource;
    }

    return std::nullopt;
}



auto SK_VirtualBackend::loadResourceFrom_BinaryData(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource> {
    for (const auto& [route, resource] : sk_bd.fileEntries){
        if (route == url){
            return resource->toResource();;
        }
    }

    return std::nullopt;
}






auto SK_VirtualBackend::handle_native_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource> {
    std::vector<juce::String> ipc_commands = {
        "sk.getMachineStaticInfo",
        "sk.getCPUInfo",
        "sk.getMemoryInfo",
        "sk.getNetworInfo",
        "sk.getMachineTime"
    };

    bool isNativeCommand = false;

    for (int i = 0; i < ipc_commands.size(); i++) {
        if (url.contains(ipc_commands[i]) == true) {
            isNativeCommand = true;
            break;
        }
    }

    if (isNativeCommand == false) return std::nullopt;

    juce::String cmd = url.substring(1, url.length());

    if (cmd == "sk.getMachineStaticInfo") return sk_c_api->machine.getStaticInfo();
    if (cmd == "sk.getCPUInfo") return sk_c_api->machine.getCPUInfo();
    if (cmd == "sk.getMemoryInfo") return sk_c_api->machine.getMemoryInfo();
    if (cmd == "sk.getMachineTime") return sk_c_api->machine.getMachineTime();
}


void SK_VirtualBackend::handle_ipc_msg_from_view(const String& sk_ipc_msg) {
    emitEventIfBrowserIsVisible("sk.ipc.event", sk_ipc_msg);
};