#pragma once

#include "sk_vb_view.hxx"
#include "BinaryData.h"

#include <filesystem>
#include <stdio.h>

#include "../../vfs/sk_vb_vfs_file.h"

#include "../../../../../sk_vbe/sk_vbe.hxx"
class SK_VirtualBackend;

auto SK_VB_ViewMngr_View::pageAboutToLoad(const juce::String& newUrl) -> bool
{
    return newUrl == juce::WebBrowserComponent::getResourceProviderRoot();
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
