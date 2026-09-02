<h1 align="center">
    DORM
</h1>
<p align="center">
    Condo detection plugin for Discord <br>
    <i>Stay safe with one click.</i>
</p>

# Disclaimer

> [!CAUTION]
> This is a userplugin for [Vencord](https://vencord.dev/), a modified Discord client, which is against Discord's ToS. Use at your own risk.

> [!WARNING]
> DO NOT use this plugin to harass, make fun of, or attack anyone.  
> The Terms of Service/Terms of Use of all three systems apply, and will be listed right here:
> 
> Detective Okappiki: https://okappiki.com/terms-of-use
> 
> Rotector: https://rotector.com/terms
> 
> Mococo (TASE): https://moco-co.org/terms
>
> Violation of any of the Terms of Use/Terms of Service(s) will result in your access to the plugin being revoked, with your Discord ID being blacklisted server-side, meaning you won't be able to change it by editing it in your DORM's code.

> [!IMPORTANT]
> We are not officially endorsed by TASE/Mococo and/or Rotector.

Credits to smokesevenstars/nyannyanfactory (the person behind https://menhera.st and https://tracked.moe) for an amazing update to the code!

# Intro

The plugin has been made for [Vencord](https://vencord.dev/) and only works alongside their directory as is normal for any and all userplugins for Vencord.

Detective Okappiki Rotector Mococo, in short **DORM** is a plugin developed by the creator of the Discord Bot known as [Detective Okappiki](https://okappiki.com/), DullBrad

The plugin allows you to view flags on every user you come across, letting you easily check if they are flagged on 3 condo detection services:  
[Okappiki](https://okappiki.com)  
[Rotector](https://rotector.com)  
[Mococo (TASE)](https://moco-co.org/)

<details>
<summary><strong>What is a flag?</strong></summary>

Flags are indicators that a user may have participated in **Condos** (Roblox games with sexual content) or other scenarios that might have endangered children.  
The DORM userplugin allows you to check users against a list of databases provided by providers that flag users for this type of content using various methods, without the hassle of checking them on each. Whether you trust them or not is up to you.
</details>

<sub>All the credits regarding the TASE/Mococo and Rotector APIs go to their respective creators, [Doqe (slopisekai)](https://slop.isekai.fyi/) and [jaxron (robalyx)](https://rotector.com/).</sub>

# Features

| Feature | Implemented? |
| --- | --- |
| Rotector, Mococo, Okappiki checks? | ✅ |
| EASI checks? | ❌ |
| Automatic checking? | ⚠️ Only boolean after first check |
| Familiar UI? | ✅ Familiar Discord tab styling |
| Customizable appearance? | ✅ |

# How to use

The plugin's functionality is simple. Upon enabling the plugin, badges will appear next to users' names. These badges will have text indicating what flag status the user has.

| Status | Description |
| --- | --- |
| Not checked | The user is not checked yet. It is unknown whether they are flagged or not |
| Not flagged | The user is not flagged on all 3 services. This does not mean the user is inherently "safe" |
| Flagged | The user is flagged on atleast one database |
| Loading | Self-explanatory |
| Creator | The creator of the DORM plugin |

> [!IMPORTANT]
> Please do not treat flags as one piece of information. A flag is a heads up, and does not mean we have called the user a predator. **Flags should not replace your judgement and you should never assume flags are right.**

You may click on a user's badge which will lead you to their profile. On this tab you can see the user's flag status and you may check the user, updating their flag status.

Flag statuses that have been updated more than 7 days ago will be highlighted in yellow, same goes for 30 days except highlighted in red, as these flags may be outdated. Please do not be afraid to check a user before using the flag as information.

# Appealing

If you've found yourself to be flagged or were alerted of being flagged, you may wish to appeal your flag at each of the services respectively:

> [Okappiki](https://okappiki.com/appeal)  
> [Rotector](https://rotector.com)  
> [Mococo (TASE)](https://discord.gg/VH4e8Wxfmd)

Please verify that you are appealing for the correct service. For example, do not appeal on Okappiki for a Rotector flag. You may be flagged on multiple services.

# Installing

## Use installation script (Recommended)
> [!IMPORTANT]
> Installation script is experimental and in beta, use it at your own risk. At the moment, it is able to only run on **updated Windows 10/11**. Windows 11 has not been tested. Sorry Windows 7/Linux folks, you will have to build from source.

> [!NOTE]
> If you have a previous Vencord installation, this will override your current Vencord installation.
>
> If you built from source before, you will lose your existing userplugins (they will however NOT be deleted, unless you have your Vencord directory in the same place of the DORM directory). Build from source instead and add DORM to your existing userplugins if you wish to prevent this.

Installing the DORM plugin this way is simple, and requires very little actual Vencord/PC knowledge.

### Quick installation remotely
1. Click the **Start Menu**, type `Windows PowerShell`, and open it.
2. Copy and paste the code below and press **Enter.**
```powershell
irm https://raw.githubusercontent.com/JustCallMeBrad/DetectiveOkappikiRotectorMococo/refs/heads/main/install.ps1 | iex
```

### Traditional
1. Download [install.ps1](./install.ps1)
2. Run the file through Windows PowerShell

Follow with the instructions on-screen.
<details> 
<summary><h4>File [...] cannot be loaded because running scripts is disabled on this system.</h4></summary>
  
1. Run `Windows PowerShell` **as Administrator.**
2. Paste in the code below.
```powershell
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process -Force
```
3. Retry. Execute the installation script in the same window where you pasted this line of code.
</details>
<details>
<summary><h4>PowerShell updated your execution policy successfully, but the setting is overridden by a policy defined at a more specific scope. [...]</h4></summary>

This is due to your [Group Policies](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-overview) or [Registry](https://learn.microsoft.com/en-us/troubleshoot/windows-server/performance/windows-registry-advanced-users). You will go have to change them to a less strict setting that allows the script to run.

We will provide some common places of where you might have set these policies:

Group Policy:
- Administrative Templates\Windows Components\Windows PowerShell\Turn on Script Execution

Registry:
- HKLM\SOFTWARE\Policies\Microsoft\PowerShellCore
- HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell

Unfortunately, if your machine is managed by a **school, workplace, organization, or a system administrator**, there is not much you can do other than contact them.
We will not be providing guides on how to jailbreak these policies.

Once done, remember to change your security policies back to what they were, unless you have changed your mind about them.
</details>

## Building from source
Follow this **[guide](https://docs.vencord.dev/installing/custom-plugins/)**.

# Credits

Plugin creator: DullBrad, smokesevenstars  
Detective Okappiki Creator: DullBrad  
Rotector Creator: jaxron (robalyx)  
Mococo (TASE) Creator: doqe (slopisekai)  
Credits to smokesevenstars/nyannyanfactory (the person behind https://menhera.st and https://tracked.moe) for an amazing update to the code!

# License

GPL-3.0