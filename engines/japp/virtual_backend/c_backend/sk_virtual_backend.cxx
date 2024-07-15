#include "sk_virtual_backend.hxx"
#include "BinaryData.h"

#include <filesystem>
#include <stdio.h>

#include "sk_vb_c_api/sk_vb_fs.h"

//#include "ssc/core/json.hh"

void SK_VirtualBackend::propagateThisPointer(SK_VirtualBackend* thisPtr) {
    //sk_c_api.propagate_vbe_pointer(thisPtr);
}

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

    if (resourceName == "LICENSE") {
        auto x = 0;
    }

    resource.mimeType =  lookUpMimeType(BinaryData::getNamedResourceOriginalFilename(resourceName.toUTF8()));

    return resource;
}

auto SK_VirtualBackend::lookUpMimeType(const juce::String& filename,
                             const juce::String& defaultMimeType) -> juce::String
{
    juce::String substr = defaultMimeType;

    if (filename == "LICENSE") {
        auto x = 0;
    }

    auto step1 = std::filesystem::path(filename.toStdString());
    auto step2 = step1.extension();
    auto step3 = step2.string();

    if (step3.empty() == true) return defaultMimeType;
    else substr = step3.substr(1);

    

    if (auto iterator{ s_mimeTypes.find(substr) };
        iterator != s_mimeTypes.end())
    {
        return iterator->second;
    }

    else
    {
        return defaultMimeType;
    }
}



auto SK_VirtualBackend::lookUpResource(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource> {
    const auto requestedUrl{ url == "/" ? juce::String{"/superkraft/engines/japp/virtual_backend/web_frontend/sk_vb.html"} : url };


    if (is_IPC_command(url) == true) {
        return handle_IPC_command(url);
    }

    const bool loadFromDisk = true;

    if (loadFromDisk == true){
        return loadResourceFrom_Disk(requestedUrl);
    } else {
        return loadResourceFrom_BinaryData(requestedUrl);
    }
}


auto SK_VirtualBackend::loadResourceFrom_Disk(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource> {


    juce::WebBrowserComponent::Resource resource;
    auto filename = std::filesystem::path(url.toStdString()).filename().string();
    
    
    juce::String targetPath = SK_FS::getProjectPath() + "/assets" + url;

    FILE* file = fopen(targetPath.toStdString().c_str(), "rb");
    if (file)
    {
        fseek(file, 0, SEEK_END);
        long dataSize = ftell(file);
        char* buffer = (char*)malloc(dataSize + 1);
        fseek(file, 0, SEEK_SET);
        fread(buffer, 1, dataSize, file);


        resource.data.resize(dataSize);
        std::memcpy(resource.data.data(), buffer, dataSize);

        free(buffer);

        fclose(file);

        resource.mimeType = lookUpMimeType(filename);

        return resource;
    }

    return std::nullopt;
}


auto SK_VirtualBackend::loadResourceFrom_BinaryData(const juce::String& url) -> std::optional<juce::WebBrowserComponent::Resource> {
    for (const auto& [route, resource] : s_resources){
        if (url == route){
            return resource;
        }
    }

    return std::nullopt;
}





bool SK_VirtualBackend::is_IPC_command(juce::String url) {
    std::vector<juce::String> ipc_commands = {
        "sk.ipc"
        /*
        "platform.primordials",
        "os.paths",
        "fs.constants",
        "fs.getOpenDescriptors",
        */
    };

    std::string urStdStr = url.toStdString();

    for (int i = 0; i < ipc_commands.size(); i++) {
        if (url.contains(ipc_commands[i]) == true) {
            return true;
        }
    }

    return false;
}

auto SK_VirtualBackend::handle_IPC_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource> {
    juce::String cmd = url.substring(1, url.indexOf("?"));

    //if (cmd == "sk.ipc") sk_c_api.handle_ipc_cmd(cmd);

    //parse url parameters
    //...

    //call appropriate IPC map
    /*
    if (cmd == "platform.primordials") return createJSONResponse(ssc_wrapper.ipc_maps.platformPrimordials.get());
    if (cmd == "os.paths") return createJSONResponse(ssc_wrapper.ipc_maps.osPaths.get());
    if (cmd == "fs.constants") return createJSONResponse(ssc_wrapper.ipc_maps.fsConstants.get());
    if (cmd == "fs.getOpenDescriptors") return createJSONResponse(ssc_wrapper.ipc_maps.fsGetOpenDescriptors.get());
    */
    return std::nullopt;
}

/*auto SK_VirtualBackend::createJSONResponse(SSC::JSON::Object json) -> std::optional<juce::WebBrowserComponent::Resource> {
    juce::WebBrowserComponent::Resource resource;
    resource.mimeType = lookUpMimeType("foo.json");

    std::string buffer = json.str().c_str();

    long dataSize = buffer.size();

    resource.data.resize(dataSize);
    std::memcpy(resource.data.data(), buffer.c_str(), dataSize);

    
    return resource;
}*/