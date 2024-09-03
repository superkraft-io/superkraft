#pragma once

class SK_VirtualBackend;

class SK_VB_Router {
public:
	SK_VirtualBackend* vbe;

    SK_VB_Router(SK_VirtualBackend *_vbe);
	~SK_VB_Router();
    
    auto lookUpResource(const juce::String& url, const juce::String& viewID = "") -> std::optional<juce::WebBrowserComponent::Resource>;
    std::optional<juce::WebBrowserComponent::Resource> loadResourceFrom_Disk(const juce::String& url);
    std::optional<juce::WebBrowserComponent::Resource> loadResourceFrom_BinaryData(const juce::String& url);
    auto handle_native_command(juce::String url) -> std::optional<juce::WebBrowserComponent::Resource>;
    
    
    static juce::String removeLeadingWhitespace(const juce::String& multilineString){
        // Split the input string into lines
        juce::StringArray old_lines;
        old_lines.addLines(multilineString);
        
        juce::StringArray new_lines;

        // Trim leading whitespace from each line
        for (auto& line : old_lines)
        {
            line = line.trimStart(); // Removes leading whitespace
            if (line.length() > 0) new_lines.add(line);
        }
        

        // Combine the lines back into a single string
        return new_lines.joinIntoString("\n"); // Rejoin with newline characters
    }
};
