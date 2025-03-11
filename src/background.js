chrome.runtime.onInstalled.addListener(async ()=>{
  await updateIconTheme()
    await enableSidePanel()
})

chrome.runtime.onStartup.addListener(async ()=>{
  await updateIconTheme()
})

async function enableSidePanel(){
    chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))
}

async function updateIconTheme(){
  const theme = await chrome.storage.local.get(["revealTheme"])

  const themeInStorage = theme.revealTheme || "light"

  if(themeInStorage == "dark"){
    chrome.action.setIcon({
      path: {
          16: "/src/assets/images/icon16(dark).png",
          32: "/src/assets/images/icon32(dark).png",
          48: "/src/assets/images/icon48(dark).png",
          128: "/src/assets/images/icon128(dark).png"
      },
    });
  }else{
    chrome.action.setIcon({
      path: {
          16: "/src/assets/images/icon16(light).png",
          32: "/src/assets/images/icon32(light).png",
          48: "/src/assets/images/icon48(light).png",
          128: "/src/assets/images/icon128(light).png"
      },
    });
  }
}

chrome.commands.onCommand.addListener((shortcut) => {
  console.log('lets reload');
  console.log(shortcut);
  if(shortcut.includes("+M")) {
      chrome.runtime.reload();
  }
})