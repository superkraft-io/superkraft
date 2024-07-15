#pragma once

#include "./maps/platform_primordials.h"
#include "./maps/os_paths.h"
#include "./maps/fs_constants.h"
#include "./maps/fs_getOpenDescriptors.h"

class SSC_IPC_Maps {
public:
	SSC_IPC_Map_PlatformPrimordials platformPrimordials;
	SSC_IPC_Map_OSPaths osPaths;
	SSC_IPC_Map_FSConstants fsConstants;
	SSC_IPC_Map_FSGetOpenDescriptors fsGetOpenDescriptors;
};
