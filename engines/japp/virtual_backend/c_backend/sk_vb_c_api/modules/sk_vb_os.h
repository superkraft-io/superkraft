#pragma once

#include <JuceHeader.h>

#include "../../ssc/core/json.hh"

#if defined(_WIN32) || defined(_WIN64)
    #include <windows.h>
    #include <VersionHelpers.h>
#else
    #include <sys/utsname.h>
    #include <unistd.h>
#endif

#include <iostream>
#include <iomanip>



typedef NTSTATUS(WINAPI* RtlGetVersionFunc)(RTL_OSVERSIONINFOEXW*);



class SK_Machine {
public:

    juce::WebBrowserComponent::Resource SK_Machine::JSON2Resource(SSC::JSON::Object json) {
        juce::WebBrowserComponent::Resource resource;

        std::string data = json.str().c_str();

        resource.data.resize(data.length());

        std::memcpy(resource.data.data(), data.c_str(), data.length());


        resource.mimeType = "application/json";

        return resource;
    }

    juce::WebBrowserComponent::Resource SK_Machine::respondError(std::string errorMsg) {
        auto json = SSC::JSON::Object{ SSC::JSON::Object::Entries{
            {"error", errorMsg}
        }};
        return JSON2Resource(json);
    }




    std::string SK_Machine::getCPUArch() {
        #if defined(__x86_64__) || defined(_M_X64)
            return "x64";
        #elif defined(__i386__) || defined(_M_IX86)
            return "x86";
        #elif defined(__arm__) || defined(_M_ARM)
            return "arm";
        #elif defined(__aarch64__) || defined(_M_ARM64)
            return "arm64";
        #elif defined(__ia64__) || defined(_M_IA64)
            return "ia64";
        #elif defined(__mips__) || defined(__mips)
            #if defined(__LP64__) || defined(_LP64)
                return "mips64";
            #else
                return "mips";
            #endif
        #elif defined(__mipsel__) || defined(__mips_le)
            #if defined(__LP64__) || defined(_LP64)
                return "mips64el";
            #else
                return "mipsel";
            #endif
        #elif defined(__powerpc__) || defined(__powerpc64__)
            #if defined(__PPC64__)
                return "ppc64";
            #else
                return "ppc";
            #endif
        #elif defined(__s390__) || defined(__s390x__)
            #if defined(__s390x__)
                return "s390x";
            #else
                return "s390";
            #endif
        #elif defined(__riscv)
            #if __riscv_xlen == 64
                return "riscv64";
            #else
                return "riscv32";
            #endif
        #else
            return "Unknown architecture";
        #endif
    }

    std::string SK_Machine::getMachineType(){
        #if defined(_WIN32) || defined(_WIN64)
            SYSTEM_INFO sysinfo;
            GetNativeSystemInfo(&sysinfo);

            switch (sysinfo.wProcessorArchitecture) {
                case PROCESSOR_ARCHITECTURE_AMD64:
                    return "x86_64";  // 64-bit AMD or Intel
                case PROCESSOR_ARCHITECTURE_INTEL:
                    return "i386";    // 32-bit Intel x86
                case PROCESSOR_ARCHITECTURE_ARM:
                    return "arm";     // ARM
                case PROCESSOR_ARCHITECTURE_ARM64:
                    return "arm64";   // ARM64
                case PROCESSOR_ARCHITECTURE_IA64:
                    return "ia64";    // Itanium
                case PROCESSOR_ARCHITECTURE_ALPHA:
                    return "alpha";   // Alpha
                case PROCESSOR_ARCHITECTURE_SHX:
                    return "shx";     // Hitachi SuperH
                case PROCESSOR_ARCHITECTURE_PPC:
                    return "ppc";     // PowerPC
                case PROCESSOR_ARCHITECTURE_MIPS:
                    return "mips";    // MIPS
                case PROCESSOR_ARCHITECTURE_IA32_ON_WIN64:
                    return "wow64";   // 32-bit application running on 64-bit Windows
                case PROCESSOR_ARCHITECTURE_ALPHA64:
                    return "alpha64";    // Alpha 64-bit
                case PROCESSOR_ARCHITECTURE_MSIL:
                    return "msil";       // Microsoft Intermediate Language (MSIL)
                case PROCESSOR_ARCHITECTURE_ARM32_ON_WIN64:
                    return "arm32_wow";  // ARM32 application running on 64-bit Windows
                case PROCESSOR_ARCHITECTURE_NEUTRAL:
                    return "neutral";    // ARM64 neutral (not supported in Windows)
                case PROCESSOR_ARCHITECTURE_IA32_ON_ARM64:
                    return "wow_arm64";  // WOW64 on ARM64 (not supported in Windows)
                default:
                    return "Unknown machine type";
            }
        #elif
            struct utsname buffer;
            if (uname(&buffer) != 0) {
                return "Unknown machine type";
            }

            return buffer.machine;
        #endif
    }


    std::string SK_Machine::getOSType() {
        // Determine the platform using preprocessor macros

        #if defined(_WIN32)
        // Windows platform
            OSVERSIONINFOEX osvi;
            ZeroMemory(&osvi, sizeof(OSVERSIONINFOEX));
            osvi.dwOSVersionInfoSize = sizeof(OSVERSIONINFOEX);

            if (GetVersionEx(reinterpret_cast<OSVERSIONINFO*>(&osvi))) {
                switch (osvi.dwPlatformId) {
                case VER_PLATFORM_WIN32_NT:
                    return "Windows_NT";
                case VER_PLATFORM_WIN32_WINDOWS:
                    return "Windows";
                case VER_PLATFORM_WIN32s:
                    return "Windows 3.x";
                default:
                    return "Unknown";
                }
            }
            else {
                return "Unknown";
            }

        #elif defined(__APPLE__ || __linux__)
        // macOS platform
            struct utsname buffer;
            if (uname(&buffer) == 0) {
                return buffer.sysname;
            }
            else {
                return "Unknown";
            }

        #else
        // Unsupported platform
            return "Unknown";
        #endif
    }

    std::string SK_Machine::getOSPlatform() {
        // Determine the platform using preprocessor macros
        #if defined(_WIN32)
            return "win32";
        #elif defined(__APPLE__)
            return "darwin";
        #elif defined(__linux__)
            return "linux";
        #elif defined(__FreeBSD__)
            return "freebsd";
        #elif defined(__OpenBSD__)
            return "openbsd";
        #elif defined(__NetBSD__)
            return "netbsd";
        #elif defined(__sun) && defined(__SVR4)
            return "sunos";
        #elif defined(_AIX)
            return "aix";
        #elif defined(__ANDROID__)
            return "android";
        #elif defined(__DragonFly__)
            return "dragonfly";
        #else
            return "unknown";
        #endif
    }


    std::string SK_Machine::getOSVersion(bool releaseVersion = true) {
        #if defined(_WIN32)
            RTL_OSVERSIONINFOEXW osvi;
            ZeroMemory(&osvi, sizeof(RTL_OSVERSIONINFOEXW));
            osvi.dwOSVersionInfoSize = sizeof(RTL_OSVERSIONINFOEXW);

            // Load ntdll.dll dynamically
            HMODULE hMod = GetModuleHandle("ntdll.dll");
            if (hMod != nullptr) {
                // Get address of RtlGetVersion function
                RtlGetVersionFunc pRtlGetVersion = reinterpret_cast<RtlGetVersionFunc>(GetProcAddress(hMod, "RtlGetVersion"));
                if (pRtlGetVersion != nullptr) {
                    // Call RtlGetVersion to fill osvi structure
                    if (pRtlGetVersion(&osvi) == 0) { // Check for success directly
                        // Construct version string
                        std::string version = std::to_string(osvi.dwMajorVersion) + "." + std::to_string(osvi.dwMinorVersion) + "." + std::to_string(osvi.dwBuildNumber);
                        
                        if (releaseVersion == false){
                            version = "Windows " + std::to_string(osvi.dwMajorVersion);
                            if (osvi.wSuiteMask & VER_SUITE_PERSONAL) version += " Home";
                            else  version += " Pro";
                        }

                        return version;
                    }
                }
            }
            return "unknown";
        #elif defined(__APPLE__ || __linux__)
            FILE* pipe = popen("/usr/bin/sw_vers -productVersion", "r");
            if (!pipe) return "unknown";

            char buffer[128];
            std::string result = "";
            while (!feof(pipe)) {
                if (fgets(buffer, 128, pipe) != NULL)
                    result += buffer;
        }
            pclose(pipe);

            // Trim newline character if present
            if (!result.empty() && result[result.length() - 1] == '\n')
                result.erase(result.length() - 1);

            return result;
        #endif
    }

    std::string getHostname() {
        #if defined(_WIN32)
            TCHAR buffer[MAX_COMPUTERNAME_LENGTH + 1];
            DWORD size = sizeof(buffer) / sizeof(buffer[0]);

            if (GetComputerNameEx(ComputerNameDnsHostname, buffer, &size)) {
                return std::string(buffer);
            }
            else {
                return "<unknown>";
            }

        #elif defined(__APPLE__)
            char buffer[256];
            if (gethostname(buffer, sizeof(buffer)) == 0) {
                return std::string(buffer);
            }
            else {
                return "<unknown>";
            }
        #endif
    }

    juce::WebBrowserComponent::Resource SK_Machine::getStaticInfo(){
        SSC::JSON::Object json = SSC::JSON::Object{ SSC::JSON::Object::Entries{
            {"EOL", "\\n"},
            {"endianess", (juce::ByteOrder::isBigEndian() ? "BE" : "LE")},
            {"arch", getCPUArch()},
            {"machine", getMachineType()},
            {"platform", getOSPlatform()},
            {"release", getOSVersion()}, //OS build
            {"type", getOSType()},
            {"version", getOSVersion(false)},

            {"devNull", "/dev/null"},

            { "hostname", getHostname()},

            { "homedir", juce::File::getSpecialLocation(juce::File::SpecialLocationType::userHomeDirectory).getFullPathName().replace("\\", "/").toStdString()}, //OS version
            { "tmpdir", juce::File::getSpecialLocation(juce::File::SpecialLocationType::tempDirectory).getFullPathName().replace("\\", "/").toStdString() },

        } };

        #if ANDROID == 1
        #elif APPLE == 1
        #elif linux == 1
        #elif _WIN32 == 1
            json.set("EOL", "\\r\\n");
            json.set("devNull", "\\\\.\\nul");
        #endif

           
                

        
        
        return JSON2Resource(json);
    }

    juce::WebBrowserComponent::Resource SK_Machine::getCPUInfo() {
        SSC::JSON::Object cpu = SSC::JSON::Object::Entries{
            {"coreCount", SystemStats::getNumCpus()}, //used by availableParallelism
            {}
        };



        /*cpu.data.insert({
            {"model", ""}, //e.g "12th Gen Intel(R) Core(TM) i9-12900K"
            {"speed", 0}, //in MHz
            {"times", SSC::JSON::Object::Entries{
                {"user", 0},
                {"nice", 0},
                {"sys" , 0},
                {"idle", 0},
                {"irq" , 0}

            }}
        });*/

        return JSON2Resource(cpu);
    }

    juce::WebBrowserComponent::Resource SK_Machine::getMemoryInfo() {
        MEMORYSTATUSEX memoryStatus;
        memoryStatus.dwLength = sizeof(MEMORYSTATUSEX);

        if (GlobalMemoryStatusEx(&memoryStatus)){
            
        } else {
            return respondError("Unable to get memory status");
        }

        SSC::JSON::Object info = SSC::JSON::Object::Entries{
            {"physical", SSC::JSON::Object::Entries{
                {"free", memoryStatus.ullAvailPhys},
                {"total", memoryStatus.ullTotalPhys},
                {"used", memoryStatus.ullTotalPhys - memoryStatus.ullAvailPhys}
            }},

            {"page", SSC::JSON::Object::Entries{
                {"free", memoryStatus.ullAvailPageFile},
                {"total", memoryStatus.ullTotalPageFile},
                {"used", memoryStatus.ullTotalPageFile - memoryStatus.ullAvailPageFile}
            }},

            {"virtual", SSC::JSON::Object::Entries{
                {"free", memoryStatus.ullAvailVirtual},
                {"total", memoryStatus.ullTotalVirtual},
                {"used", memoryStatus.ullTotalVirtual - memoryStatus.ullAvailVirtual}
            }},

            {"extendedAvailable", (size_t)memoryStatus.ullAvailExtendedVirtual},
            {"usageInPercent",(size_t)memoryStatus.dwMemoryLoad}
        };

        return JSON2Resource(info);
    }

    juce::WebBrowserComponent::Resource SK_Machine::getNetworkInfo() {
        SSC::JSON::Object info = SSC::JSON::Object::Entries{

        };

        return JSON2Resource(info);
    }

    juce::WebBrowserComponent::Resource SK_Machine::getMachineTime() {
        double number = GetTickCount64();  // Example number
        double result = number / 1000.0;

        // Store the formatted result in a string variable
        std::ostringstream uptime_three_decimals;
        uptime_three_decimals << std::fixed << std::setprecision(3) << result;
        std::string uptime_three_decimals_str = uptime_three_decimals.str();

        SSC::JSON::Object info = SSC::JSON::Object::Entries{
            {"uptime", stof(uptime_three_decimals_str)}
        };

        return JSON2Resource(info);
    }

    juce::WebBrowserComponent::Resource SK_Machine::getTemplate() {
        SSC::JSON::Object info = SSC::JSON::Object::Entries{
               
        };

        return JSON2Resource(info);
    }
};
