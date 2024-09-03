#pragma once

#include "../../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_vfs.h"

using namespace std::chrono;

SK_VB_VFS::SK_VB_VFS(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}
SK_VB_VFS::~SK_VB_VFS()
{
    for (int i = 0; i < entries.size(); i++)
        delete entries[i];
}

void SK_VB_VFS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");
    
    auto start = high_resolution_clock::now();

   

    String operation = info.getProperty("operation", "");
    String path = info.getProperty("path", "");
    String data = info.getProperty("data", "");

    String fullPath = path;

    if (operation == "access") access(msgID, fullPath, responseData);
    else if (operation == "stat") stat(msgID, fullPath, responseData);
    else if (operation == "writeFile") writeFile(msgID, fullPath, data, responseData);
    else if (operation == "readFile") readFile(msgID, fullPath, responseData);
    else if (operation == "readdir") readdir(msgID, fullPath, responseData);
    else if (operation == "readJSON") readJSON(msgID, fullPath, responseData);
    else if (operation == "writeJSON") writeJSON(msgID, fullPath, data, responseData);
};


SK_VB_VFS_File* SK_VB_VFS::findByPath(String path) {
    for (int i = 0; i < entries.size(); i++) {
        SK_VB_VFS_File* file = entries[i];
        if (file->path == path) return entries[i];
    }

    return nullptr;
}

void SK_VB_VFS::access(String msgID, String path, String& responseData) {
    responseData = "{\"access\": false}";
    SK_VB_VFS_File* file = findByPath(path);
    if (file != nullptr) responseData = "{\"access\": true}";
}

void SK_VB_VFS::stat(String msgID, String path, String& responseData) {
    SK_VB_VFS_File* file = findByPath(path);

    if (file == nullptr) {
        responseData = SK_IPC::Error("ENOENT");
        return;
    }
   

    auto statInfo = SSC::JSON::Object(SSC::JSON::Object::Entries{
        {"type", "file"},
        {"dev", -1},
        {"mode", -1},
        {"nlink", 1},
        {"uid", 0},
        {"gid", 0},
        {"rdev", 0},
        {"blksize", -1},
        {"ino", 0},
        {"size", file->getSize()},
        {"blocks", -1},
        {"atimeMs", file->atime},
        {"mtimeMs", file->mtime},
        {"ctimeMs", file->ctime},
        {"birthtimeMs", file->ctime},
        {"atime"    , ""},
        {"mtime"    , ""},
        {"ctime"    , ""},
        {"birthtime", ""}
    });

    
    auto tempstr = statInfo.str();
}

void SK_VB_VFS::writeFile(String msgID, String path, String data, String& responseData) {
    entries.push_back(new SK_VB_VFS_File());

    auto file = entries.at(entries.size() - 1);
    file->path = path;
    file->data = data;

    responseData = SK_IPC::OK;
}

void SK_VB_VFS::readFile(String msgID, String path, String& responseData) {
    SK_VB_VFS_File* file = findByPath(path);

    if (file == nullptr) {
        responseData = SK_IPC::Error("ENOENT");
        return;
    }

    responseData = file->data;
}

void SK_VB_VFS::readdir(String msgID, String path, String& responseData) {

    responseData = SK_IPC::OK;    
}

void SK_VB_VFS::readJSON(String msgID, String path, String& responseData) {

    responseData = SK_IPC::OK;
}

void SK_VB_VFS::writeJSON(String msgID, String path, String data, String& responseData) {

    responseData = SK_IPC::OK;
}
