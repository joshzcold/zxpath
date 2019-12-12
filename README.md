# zxpath
Get Ze-Xpath... get it?

# Contributers
- Joshua Cold -> joshua.cold@microfocus.com
- Reed McFadden -> reed.mcfadden@microfocus.com
- Rockwell Holbrook -> rockwell.holbrook@microfocus.com
- Taylor Allred -> taylor.allred@microfocus.com
- Zach Hall -> zachary.hall@microfocus.com

## Operations
- highlight elements you want identifiers generated for
- ZXpath will generate multiple identifiers per element and determine which would be best. You can choose which to pick per element
- ZXPath will verify elements are A. unquie on the page B. Are valid selectors
- ZXPath will generate methods for clicking, sending text, clearing for each element where applicable
- ZXPath takes options for: Selector Priority, Generated Code Language, Text output, variable creation.

# Diagram
![ZXpath design](/docs/ZXpath-Design.png)


## Application Broken Up Components

- red border clicks on elements, clicks do not activate element (freeze page)
-	Givin html element (<btn/>) determine if element has already has usuable id
-	Givin html element determine if it already has a good variable name
-	On element click give popup of results next to element and allow for naming of element in popup
-	Give multiple results and allow selection of preferred result
-	Givin selector verify selector is unique and valid on page
-	Givin list of valid selectors generate page of either (allow list to be downloaded):
-	Variables
	-	Variables + Methods
	-	Raw values
	
	
-	Allow differn't languages for generated page
-	Givin element popup allow option to choose preference of selector priority (xpath, id, css, etc.)
-	Activate select mode on a hot key combo
	
##	Application Joined Components:
-	On click highlight element and async analysis on element
-	anaylsis async verifies elements are unique and valid
-	User is givin options in popups next to highlighted elements
-	generation of page takes inputs from popups
-	generation of page will open in raw text or download
