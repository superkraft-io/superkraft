#pragma once

#include <JuceHeader.h>
#include <string>

#include "../../../ssc/core/json.hh"


using namespace SSC;

class SSC_IPC_Map_OSPaths {
public:
    SSC::JSON::Object get() {
        SSC::JSON::Object data;

        // paths
        SSC::String resources = juce::File::getCurrentWorkingDirectory().getFullPathName().toStdString();
        SSC::String downloads;
        SSC::String documents;
        SSC::String pictures;
        SSC::String desktop;
        SSC::String videos;
        SSC::String music;
        SSC::String home;

#if defined(__APPLE__)
        static const auto uid = getuid();
        static const auto pwuid = getpwuid(uid);
        static const auto HOME = pwuid != nullptr
            ? String(pwuid->pw_dir)
            : Env::get("HOME", getcwd());

        static const auto fileManager = NSFileManager.defaultManager;

#define DIRECTORY_PATH_FROM_FILE_MANAGER(type) (                             \
    String([fileManager                                                        \
        URLForDirectory: type                                                  \
               inDomain: NSUserDomainMask                                      \
      appropriateForURL: nil                                                   \
                 create: NO                                                    \
                  error: nil                                                   \
      ].path.UTF8String)                                                       \
    )

        // overload with main bundle resources path for macos/ios
        resources = String(NSBundle.mainBundle.resourcePath.UTF8String);
        downloads = DIRECTORY_PATH_FROM_FILE_MANAGER(NSDownloadsDirectory);
        documents = DIRECTORY_PATH_FROM_FILE_MANAGER(NSDocumentDirectory);
        pictures = DIRECTORY_PATH_FROM_FILE_MANAGER(NSPicturesDirectory);
        desktop = DIRECTORY_PATH_FROM_FILE_MANAGER(NSDesktopDirectory);
        videos = DIRECTORY_PATH_FROM_FILE_MANAGER(NSMoviesDirectory);
        music = DIRECTORY_PATH_FROM_FILE_MANAGER(NSMusicDirectory);
        home = String(NSHomeDirectory().UTF8String);

#undef DIRECTORY_PATH_FROM_FILE_MANAGER

#elif defined(__linux__)
        static const auto uid = getuid();
        static const auto pwuid = getpwuid(uid);
        static const auto HOME = pwuid != nullptr
            ? String(pwuid->pw_dir)
            : Env::get("HOME", getcwd());

        static const auto XDG_DOCUMENTS_DIR = Env::get("XDG_DOCUMENTS_DIR");
        static const auto XDG_DOWNLOAD_DIR = Env::get("XDG_DOWNLOAD_DIR");
        static const auto XDG_PICTURES_DIR = Env::get("XDG_PICTURES_DIR");
        static const auto XDG_DESKTOP_DIR = Env::get("XDG_DESKTOP_DIR");
        static const auto XDG_VIDEOS_DIR = Env::get("XDG_VIDEOS_DIR");
        static const auto XDG_MUSIC_DIR = Env::get("XDG_MUSIC_DIR");

        if (XDG_DOCUMENTS_DIR.size() > 0) {
            documents = XDG_DOCUMENTS_DIR;
        }
        else {
            documents = (Path(HOME) / "Documents").string();
        }

        if (XDG_DOWNLOAD_DIR.size() > 0) {
            downloads = XDG_DOWNLOAD_DIR;
        }
        else {
            downloads = (Path(HOME) / "Downloads").string();
        }

        if (XDG_DESKTOP_DIR.size() > 0) {
            desktop = XDG_DESKTOP_DIR;
        }
        else {
            desktop = (Path(HOME) / "Desktop").string();
        }

        if (XDG_PICTURES_DIR.size() > 0) {
            pictures = XDG_PICTURES_DIR;
        }
        else if (fs::exists(Path(HOME) / "Images")) {
            pictures = (Path(HOME) / "Images").string();
        }
        else if (fs::exists(Path(HOME) / "Photos")) {
            pictures = (Path(HOME) / "Photos").string();
        }
        else {
            pictures = (Path(HOME) / "Pictures").string();
        }

        if (XDG_VIDEOS_DIR.size() > 0) {
            videos = XDG_VIDEOS_DIR;
        }
        else {
            videos = (Path(HOME) / "Videos").string();
        }

        if (XDG_MUSIC_DIR.size() > 0) {
            music = XDG_MUSIC_DIR;
        }
        else {
            music = (Path(HOME) / "Music").string();
        }

        home = Path(HOME).string();
#elif defined(_WIN32)
        static const auto HOME = juce::File::getSpecialLocation(juce::File::userHomeDirectory).getFullPathName().toStdString() + "\\";// Env::get("HOMEPATH", Env::get("HOME"));
        static const auto USERPROFILE = HOME;//Env::get("USERPROFILE", HOME);
        downloads = HOME + "Downloads";
        documents = HOME + "Documents";
        desktop = HOME + "Desktop";
        pictures = HOME + "Pictures";
        videos = HOME + "Videos";
        music = HOME + "Music";
        home = HOME;
#endif

        data["resources"] = resources;
        data["downloads"] = downloads;
        data["documents"] = documents;
        data["pictures"] = pictures;
        data["desktop"] = desktop;
        data["videos"] = videos;
        data["music"] = music;
        data["home"] = home;

        return data;


	}
};
