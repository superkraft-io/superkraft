#pragma once

#include "sk_vb_view.hxx"
#include "BinaryData.h"

#include <filesystem>
#include <stdio.h>

#include "../../vfs/sk_vb_vfs_file.h"

#include "../../../../sk_vbe/sk_vbe.hxx"
class SK_VirtualBackend;

auto SK_VB_ViewMngr_View::pageAboutToLoad(const juce::String& newUrl) -> bool
{
    return newUrl == juce::WebBrowserComponent::getResourceProviderRoot();
}


auto SK_VB_ViewMngr_View::createResource_2(const juce::String& resourceName) -> juce::WebBrowserComponent::Resource {
    juce::WebBrowserComponent::Resource resource;

    int dataSize{};
    auto namedResource{ BinaryData::getNamedResource(resourceName.toUTF8(), dataSize) };

    resource.data.resize(dataSize);
    std::memcpy(resource.data.data(), namedResource, dataSize);

    resource.mimeType = lookUpMimeType(BinaryData::getNamedResourceOriginalFilename(resourceName.toUTF8()));

    return resource;
}

auto SK_VB_ViewMngr_View::lookUpMimeType(const juce::String& filename,
    const juce::String& defaultMimeType) -> juce::String
{
    juce::String substr = defaultMimeType;

    auto step1 = std::filesystem::path(filename.toStdString());
    auto step2 = step1.extension();
    auto step3 = step2.string();

    if (step3.empty() == true) return defaultMimeType;
    else substr = step3.substr(1);



    auto str1 = substr.toStdString();
    auto str2 = s_mimeTypes[str1];
    auto mimeType = String(str2.str()).replace("\"", "");
    return mimeType;
}



auto SK_VB_ViewMngr_View::lookUpResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource> {
    const auto requestedUrl{ url == "/" ? juce::String{"/sk_vfs/sk_project/views/" + id + "/frontend/view.html"} : url };

    auto nativeCommandResponse = handle_native_command(url);
    if (nativeCommandResponse != std::nullopt) return nativeCommandResponse;

    if (vbe->mode == "debug") {
        auto res = loadResourceFrom_Disk(requestedUrl);
        return res;
    }
    else {
        auto res = loadResourceFrom_BinaryData(requestedUrl);
        return res;
    }
}


auto SK_VB_ViewMngr_View::loadResourceFrom_Disk(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource> {


    juce::WebBrowserComponent::Resource* resource = new Resource();
    auto filename = std::filesystem::path(url.toStdString()).filename().string();
    resource->mimeType = lookUpMimeType(filename);

    if (url.indexOf("sk_vfs/") > -1) {
        String fixedURL = url;
        if (fixedURL.substring(0, 1) == "/") fixedURL = fixedURL.substring(1, fixedURL.length());

        SK_VB_VFS_File* file = vbe->sk_c_api->sk->vfs->findByPath(fixedURL);
        std::string path = String(file->path).toStdString();
        //String dataStr = "<html><head></head><body style=\"font-size: 25px; color: white; background-color: #26292b;\"><br><br><br>HELLO!</body> </html>";
        String dataStr = String(file->data);
        std::string data = dataStr.toStdString();//.replace("\r\n", "").toStdString();
        size_t fileSize = data.size();
        resource->data.resize(fileSize);

        const char* dataPtr = data.c_str();
        std::memcpy(resource->data.data(), dataPtr, fileSize);


        return *resource;
    }

    if (vbe->mode == "release") {
        String fixedURL = url.replace("//", "/");

        auto query = vbe->sk_bd.findEntryByPath(fixedURL);

        if (query.first != "file") return std::nullopt;

        SK_VB_BDFS_File* entry = (SK_VB_BDFS_File*)query.second;

        return entry->toResource();
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


auto SK_VB_ViewMngr_View::loadResourceFrom_BinaryData(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource> {
    if (url.substring(0, 8) == "/sk_vfs/") {
        String vfsPath = url.substring(1, url.length());
        
        SK_VB_VFS_File* file = vbe->sk_c_api->sk->vfs->findByPath(vfsPath);
        
        if (file == nullptr) return std::nullopt;

        return file->toResource();
    }
    
    for (const auto& [route, resource] : vbe->sk_bd.fileEntries) {
        if (route == url.replace("//", "/")) {
            return resource->toResource();;
        }
    }

    return std::nullopt;
}






auto SK_VB_ViewMngr_View::handle_native_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource> {
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

    if (cmd == "sk.getMachineStaticInfo") return vbe->sk_c_api->machine.getStaticInfo();
    if (cmd == "sk.getCPUInfo") return vbe->sk_c_api->machine.getCPUInfo();
    if (cmd == "sk.getMemoryInfo") return vbe->sk_c_api->machine.getMemoryInfo();
    if (cmd == "sk.getMachineTime") return vbe->sk_c_api->machine.getMachineTime();
}

void SK_VB_ViewMngr_View::handle_ipc_msg(const var& object) {
    DynamicObject* obj = object.getDynamicObject();

    String target = obj->getProperty("target");
    String msgID = obj->getProperty("msgID");
    String cmd = obj->getProperty("cmd");

    String viewID = obj->getProperty("viewID");

    String packetStr = juce::JSON::toString(obj->getProperty("data")).replace("\r", "").replace("\n", "");

    
    SSC::JSON::Object reqInfoJson = SSC::JSON::Object::Entries{
        {"eventID", "sk.ipc"},
        {"viewID", viewID.toStdString()},
        {"data", packetStr.toStdString()}
    };

    String reqInfoStr = String(reqInfoJson.str());

    vbe->handle_ipc_msg_from_view(reqInfoStr);

};