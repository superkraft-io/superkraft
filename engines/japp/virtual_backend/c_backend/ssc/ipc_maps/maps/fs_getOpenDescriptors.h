#pragma once

#include <JuceHeader.h>
#include <string>

#include "../../../ssc/core/json.hh"


using namespace SSC;



class SSC_IPC_Map_FSGetOpenDescriptors {
private:
public:
    SSC::JSON::Object get() {
        auto json = SSC::JSON::Object::Entries{
          {"source", "fs.getOpenDescriptors"},
          {"data", {}}
        };

        return json;
	}
};
