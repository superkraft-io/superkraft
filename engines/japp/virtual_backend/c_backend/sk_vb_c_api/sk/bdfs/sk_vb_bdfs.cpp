#pragma once

#include "../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_bdfs.h"

using namespace std::chrono;

SK_VB_BDFS::SK_VB_BDFS(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}

int SK_VB_BDFS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");
    
   

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

    return (responseData == "{}" ? 0 : 1);
};

void SK_VB_BDFS::respondError(String msgID, String error, String& responseData) {
    String res = "{\"error\":\"" + error + "\"}";
    responseData = res;
}


void SK_VB_BDFS::access(String msgID, String path, String& responseData) {
    responseData = "{\"access\": false}";

    auto pair = vbe->sk_bd.findEntryByPath(path);

    if (pair.first != "none") responseData = "{\"access\": true}";
}

void SK_VB_BDFS::stat(String msgID, String path, String& responseData) {
    auto pair = vbe->sk_bd.findEntryByPath(path);

    if (pair.first == "none") {
        respondError(msgID, "ENOENT", responseData);
        return;
    }
   
    SK_VB_BDFS_Entry* entry = (SK_VB_BDFS_Entry*)pair.second;

    auto statInfo = SSC::JSON::Object(SSC::JSON::Object::Entries{
        {"type", pair.first.toStdString()},
        {"dev", -1},
        {"mode", -1},
        {"nlink", 1},
        {"uid", 0},
        {"gid", 0},
        {"rdev", 0},
        {"blksize", -1},
        {"ino", 0},
        {"size", entry->size},
        {"blocks", -1},
        {"atimeMs", entry->atime},
        {"mtimeMs", entry->mtime},
        {"ctimeMs", entry->ctime},
        {"birthtimeMs", entry->ctime},
        {"atime"    , ""},
        {"mtime"    , ""},
        {"ctime"    , ""},
        {"birthtime", ""}
    });

    
    auto tempstr = statInfo.str();

    responseData = String(tempstr);
}

void SK_VB_BDFS::writeFile(String msgID, String path, String data, String& responseData) {
   
}

void SK_VB_BDFS::readFile(String msgID, String path, String& responseData) {
    auto pair = vbe->sk_bd.findEntryByPath(path);

    if (pair.first == "dir") {
        respondError(msgID, "ENOENT", responseData);
        return;
    }

    if (pair.first == "none") {
        responseData = "\"\"";
        return;
    }
    SK_VB_BDFS_File* entry = (SK_VB_BDFS_File*)pair.second;

    String fileData = entry->toBase64();

    responseData = "\"" + fileData + "\"";
}

void SK_VB_BDFS::readdir(String msgID, String path, String& responseData) {
    responseData = vbe->sk_bd.readDir(path);
}

void SK_VB_BDFS::readJSON(String msgID, String path, String& responseData) {
    int x = 0;
}

void SK_VB_BDFS::writeJSON(String msgID, String path, String data, String& responseData) {
    int x = 0;
}