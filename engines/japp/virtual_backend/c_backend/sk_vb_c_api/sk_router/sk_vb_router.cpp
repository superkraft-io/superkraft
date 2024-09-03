#pragma once

#include <JuceHeader.h>
#include <filesystem>

#include "sk_vb_router.h"
#include "../../sk_vbe/sk_vbe.hxx"

SK_VB_Router::SK_VB_Router(SK_VirtualBackend *_vbe) {
	vbe = _vbe;

}

SK_VB_Router::~SK_VB_Router() {
}



auto SK_VB_Router::lookUpResource(const juce::String& url, const juce::String& viewID) -> std::optional<juce::WebBrowserComponent::Resource> {
    const auto requestedUrl{
        url == "/" ?
        (viewID == "" ? String{"/superkraft/engines/japp/virtual_backend/web_frontend/sk_vb.html"} : String("/sk_vfs/sk_project/views/" + viewID + "/frontend/view.html")
        ): url };

    auto nativeCommandResponse = handle_native_command(url);
    if (nativeCommandResponse != std::nullopt) return nativeCommandResponse;

    std::optional<juce::WebBrowserComponent::Resource> res;
    
    if (vbe->mode == "debug") {
        res = loadResourceFrom_Disk(requestedUrl);
    } else {
        res = loadResourceFrom_BinaryData(requestedUrl);
    }
    
    return res;
}


std::optional<juce::WebBrowserComponent::Resource>  SK_VB_Router::loadResourceFrom_Disk(const juce::String& url){


    juce::WebBrowserComponent::Resource* resource = new juce::WebBrowserComponent::Resource();
    auto filename = std::filesystem::path(url.toStdString()).filename().string();
    String mimeType = SK_VB_Helpers_MimeTypes::lookUpMimeType(filename);
    resource->mimeType = mimeType;

    if (url.indexOf("sk_vfs/") > -1) {
        String fixedURL = url;
        if (fixedURL.substring(0, 1) == "/") fixedURL = fixedURL.substring(1, fixedURL.length());
        
        SK_VB_VFS_File* file = vbe->sk_c_api->sk->vfs->findByPath(fixedURL);
        std::string path = String(file->path).toStdString();
        String dataStr = String(file->data);
        std::string data = dataStr.toStdString();
        size_t fileSize = dataStr.length();
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

    if (mimeType == "text/javascript" && url.indexOf(".min.js") == -1){
        File file(targetPath);
        
        if (file.existsAsFile()){
            String fileAsString = file.loadFileAsString();
            
            long originalSize = fileAsString.length();
            
            fileAsString = SK_VB_Router::removeLeadingWhitespace(fileAsString);
            
            long newSize = fileAsString.length();
            
            float compression = 100 * (float(newSize) / float(originalSize));
            DBG(String(url + ": " + String(compression) + "%"));
            
            long dataSize = fileAsString.toStdString().length();
            resource->data.resize(dataSize);
            std::memcpy(resource->data.data(), fileAsString.toStdString().c_str(), dataSize);
            
            return *resource;
        }
    } else {
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
    }

    return std::nullopt;
}



std::optional<juce::WebBrowserComponent::Resource> SK_VB_Router::loadResourceFrom_BinaryData(const juce::String& url){
    for (const auto& [route, resource] : vbe->sk_bd.fileEntries){
        if (route == url){
            return resource->toResource();;
        }
    }

    return std::nullopt;
}






auto SK_VB_Router::handle_native_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource> {
    String path = url.substring(1, url.length());
    
    String responseData = "{\"error\":\"invalid_ipc_request\"}";
    
    StringArray strArr;
    strArr.addTokens(path, "/", "");
    
    StringArray paramsArr;
    paramsArr.addTokens(strArr[1], "!", "");
    
    String target = strArr[0] + ":" + paramsArr[0];
    
   
    
    DynamicObject obj;
    obj.setProperty("target", target);
    
    var data;
    
   
    if (paramsArr.size() > 1){
        MemoryOutputStream decodedData;
        if (Base64::convertFromBase64(decodedData, paramsArr[1])) {
            String b63_str = decodedData.toString();
            juce::JSON::parse(b63_str, data);
            obj.setProperty("data", data);
        } else {
            DBG("Failed to decode the Base64 string.");
        }
        
        
    }
    
    if (vbe->sk_c_api->ipc->tryForwardToNativeTarget(&obj, responseData) == 0) return std::nullopt;
    
    return SK_VB_Helpers_WebResource::JSON2Resource(responseData);
}


