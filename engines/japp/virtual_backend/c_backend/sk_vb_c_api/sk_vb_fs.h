#pragma once
#include <JuceHeader.h>
#include "../ssc/core/json.hh"
#include "../simdjson/simdjson.h"

class SK_VirtualBackend;

class SK_FS {
public:
    SK_VirtualBackend * vbe;
    SK_FS(SK_VirtualBackend * _vbe);
    std::function<void(std::int64_t, std::string)> respondToCallback;
    static String SK_FS::getProjectPath();
    String SK_FS::handle_IPC_Msg(int64 msgIdx, DynamicObject *obj);
    void access(int64 msgIdx, String path);
    void stat(int64 msgIdx, String path);
    void writeFile(int64 msgIdx, String path, String data);
    void readFile(int64 msgIdx, String path);
    void readdir(int64 msgIdx, String path);
    void readJSON(int64 msgIdx, String path);
    void writeJSON(int64 msgIdx, String path, String data);
};
