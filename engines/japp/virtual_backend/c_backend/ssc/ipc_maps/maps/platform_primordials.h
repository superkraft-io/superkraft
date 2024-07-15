#pragma once

#include <string>

#include "../../../ssc/core/json.hh"


using namespace SSC;

class SSC_IPC_Map_PlatformPrimordials {
public:
    SSC::JSON::Object get() {
        return SSC::JSON::Object::Entries{
            {"source", "platform.primordials"},
                {"data", SSC::JSON::Object::Entries {
                    {"arch", "x64"},
                    {"cwd", "/"},
                    {"platform", "win32"},
                    {"version", SSC::JSON::Object::Entries {
                        {"full", "1.0"},
                        {"short", "1.0"},
                        {"hash", "xyz"}}
                    },
                    {"host-operating-system",
                    #if defined(__APPLE__)
                      #if TARGET_IPHONE_SIMULATOR
                         "iphonesimulator"
                      #elif TARGET_OS_IPHONE
                        "iphoneos"
                      #else
                         "macosx"
                      #endif
                    #elif defined(__ANDROID__)
                         (router->bridge->isAndroidEmulator ? "android-emulator" : "android")
                    #elif defined(__WIN32)
                         "win32"
                    #elif defined(__linux__)
                         "linux"
                    #elif defined(__unix__) || defined(__unix)
                         "unix"
                    #else
                         "unknown"
                    #endif
                    }
                }
            }
        };


	}
};
