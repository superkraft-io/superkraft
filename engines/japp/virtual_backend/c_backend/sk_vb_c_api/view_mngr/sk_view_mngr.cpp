#include "sk_view_mngr.h"
#include "../sk_vb_c_api.h"

#include "sk_view/sk_view.hxx"


#include "../../sk_vbe/sk_vbe.hxx"
class SK_VirtualBackend;

SK_View_Mngr::SK_View_Mngr(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}

void SK_View_Mngr::resizeViews(int width, int height) {
    for (int i = 0; i < views.size(); i++) {
        auto* view = views[i];
        view->setSize(width, height);
    }
}

SK_View* SK_View_Mngr::findViewByID(String viewID) {
    for (int i = 0; i < views.size(); i++) {
        auto* view = views[i];
        if (view->id == viewID) return view;
    }

    return nullptr;
}

void SK_View_Mngr::handle_IPC_Msg(String msgID, DynamicObject * obj, String & responseData) {
    var reqInfo = obj->getProperty("data");

    String action = reqInfo.getProperty("action", "");


    if (action == "createView") createView(msgID, reqInfo, responseData);
};

void SK_View_Mngr::createView(String msgID, var obj, String& responseData) {
    var info = obj.getProperty("info", "");


    String viewID = info.getProperty("id", "");

    SK_View* existingView = findViewByID(viewID);
    String indexPath = info.getProperty("path", "N/A");

    if (existingView != nullptr) {
        String fullPath = juce::WebBrowserComponent::getResourceProviderRoot() + indexPath;
        existingView->goToURL(fullPath);

        return;
    }


    int width = info.getProperty("width", 720);
    int height = info.getProperty("height", 480);

    int minWidth = info.getProperty("minWidth", -1);
    int minHeight = info.getProperty("minHeight", -1);

    int maxWidth = info.getProperty("maxWidth", -1);
    int maxHeight = info.getProperty("maxHeight", -1);

    String iconPath = info.getProperty("icon", "N/A");

    bool maximizable = info.getProperty("maximizable", true);
    bool minimizable = info.getProperty("minimizable", true);


    bool sameWindow = info.getProperty("sameWindow", false);

    /*
    frameless: true
    headless: false
    height: 480
    icon: "/superkraft/engines/japp/app/assets/img/icon.png"
    index: 5
    maximizable: true
    minHeight: 580
    minimizable: true
    path: "/sk_project/views/first_view/frontend/view.html"
    sameWindow: true
    title: "SK JUCE"
    webPreferences: {nodeIntegration: true, contextIsolation : false, enableRemoteModule : true}
    width: 640
    */

    
    if (sameWindow){
        
        SK_View* view = new SK_View({
            juce::WebBrowserComponent::Options{}
                .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
                .withWinWebView2Options(
                    juce::WebBrowserComponent::Options::WinWebView2{}.withUserDataFolder(
                        juce::File::getSpecialLocation(juce::File::SpecialLocationType::tempDirectory)
                    )
                )
                .withNativeIntegrationEnabled()
                .withResourceProvider([this](const String& url) {
                    String viewID = url.replace("/sk_vfs/sk_project/views/", "");
                    viewID = viewID.substring(0, viewID.indexOf("/"));

                    auto view = findViewByID("first_view");
                    auto res = view->lookUpResource(url);
                    return res;
                })
                .withEventListener("sk.ipc", [this](const auto& object) {
                    DynamicObject* obj = object.getDynamicObject();
                    vbe->sk_c_api->ipc->handle_IPC_Msg(obj);
                    /*
                    String viewID = obj->getProperty("viewID");

                    auto view = findViewByID("first_view");

                    view->handle_ipc_msg(object);
                    */
                })
        });

        view->vbe = vbe;


        views.push_back(view);

        //SK_View* view = views.at(views.size() - 1);
        
        view->id = String(viewID);

        vbe->getParentComponent()->addAndMakeVisible(view);


        String fullPath = juce::WebBrowserComponent::getResourceProviderRoot();// +indexPath;
        view->goToURL(fullPath);


        
        //view->setSize(width, height);

        vbe->getParentComponent()->setSize(width, height);
    }

    responseData = "{}";
}