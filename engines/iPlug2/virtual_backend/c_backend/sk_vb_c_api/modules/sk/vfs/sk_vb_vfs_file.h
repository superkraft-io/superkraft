#pragma once
#include <JuceHeader.h>


#include "../../../helpers/sk_vb_mimeTypes.h"

class SK_VB_VFS_File {
public:
    String path;
    String data;
    int ctime;
    int mtime;
    int atime;

    size_t getSize() const {
        return data.length();
    }

    WebBrowserComponent::Resource toResource() const {
        WebBrowserComponent::Resource resource;

        resource.data.resize(data.length());
        std::memcpy(resource.data.data(), data.toStdString().c_str(), data.length());

        resource.mimeType = SK_VB_Helpers_MimeTypes::lookUpMimeType(path);

        return resource;
    };
};
