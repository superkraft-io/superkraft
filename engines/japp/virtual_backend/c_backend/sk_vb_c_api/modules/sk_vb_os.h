#pragma once

#include <JuceHeader.h>
#include "../../ssc/core/json.hh"


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


    juce::WebBrowserComponent::Resource SK_Machine::getStaticInfo(){
        
       
       

        

        SSC::JSON::Object json = SSC::JSON::Object{ SSC::JSON::Object::Entries{
            {"arch", "x64"}, //x86, <apple silicon>
            {"machine", "x86_64"},
            {"platform", "win32"},
            {"release", "10.0.22631"}, //OS build
            {"type", "Windows_NT"}, //OS type
            {"version", "Windows 10 Pro"}, //OS version


            { "hostname", "" },

            { "homedir", juce::File::getSpecialLocation(juce::File::SpecialLocationType::userHomeDirectory).getFullPathName().replace("\\", "/").toStdString()}, //OS version
            { "tmpdir", juce::File::getSpecialLocation(juce::File::SpecialLocationType::tempDirectory).getFullPathName().replace("\\", "/").toStdString() },

        } };
        
        return JSON2Resource(json);
    }

    juce::WebBrowserComponent::Resource SK_Machine::getCPUInfo() {
        SSC::JSON::Object cpu = SSC::JSON::Object::Entries{
               {"count", 0}, //used by availableParallelism
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
        SSC::JSON::Object info = SSC::JSON::Object::Entries{

        };

        return JSON2Resource(info);
    }

    juce::WebBrowserComponent::Resource SK_Machine::getNetworkInfo() {
        SSC::JSON::Object info = SSC::JSON::Object::Entries{

        };

        return JSON2Resource(info);
    }

    juce::WebBrowserComponent::Resource SK_Machine::getMachineTime() {
        SSC::JSON::Object info = SSC::JSON::Object::Entries{

        };

        return JSON2Resource(info);
    }

    juce::WebBrowserComponent::Resource SK_Machine::getTemplate() {
        SSC::JSON::Object info = SSC::JSON::Object::Entries{
               
        };

        return JSON2Resource(info);
    }
};
