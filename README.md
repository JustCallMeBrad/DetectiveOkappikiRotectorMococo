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

Detective Okappiki Rotector Mococo, in short **DORM** is a plugin developed by the creator of the Discord Bot known as [Detective Okappiki](https://okappiki.com/), DullBrad

All the credits regarding the TASE/Mococo and Rotector APIs go to their respective creators, [Doqe (slopisekai)](https://slop.isekai.fyi/) and [jaxron (robalyx)](https://rotector.com/).

The plugin has been made for [Vencord](https://vencord.dev/) and only works alongside their directory as is normal for any and all userplugins for Vencord.

# Features

The plugin allows you to view someone's DORM flag status, which is purely based on whether or not their Discord ID is flagged on either Detective Okappiki, Rotector or Mococo (TASE).

Flag statuses will appear next to someone's username both in chat and on their profile, both popout and main. The flag status badge is clickable in all the places it appears in, and it'll send you to a modal popout which will then allow you to queue them for a flag on all three.

The FLAGS themselves do not get stored, however the fact that someone is, at the time of the check, flagged, does. This ensures that flags persist without scraping/collecting any of the data from Detective Okappiki, Rotector OR Mococo (TASE), minus the necessary boolean flag status.

So, for example, if I were to go into a discord chat and if then I clicked "NOT FLAGGED!" and "Click here to check!" the plugin itself would send a request to the https://okappiki.com/ website, in turn passing the Discord ID of the person you are checking through all three systems twice, temporarily storing their roblox data in order to ensure the most accurate data is outputted, after which it'd display the flag reasons, what they're flagged on (along with an appeal link to the system) and update their status to "FLAGGED!".

# How to use

In order to correctly use the plugin, you can't simply assume that everyone with "NOT FLAGGED!" is a safe user. "NOT FLAGGED!" can mean one of two things.

1. The person hasn't been checked via the plugin yet,
2. The person isn't flagged in general.

In order to check which one is correct, you should always check someone you are talking to, as it will not only help YOU ease your mind, but in a scenario that they are flagged, it will improve the plugin itself by updating our record on that person.

# Appealing

If you've found yourself to be flagged or were alerted of being flagged then you can appeal by following these x steps:

1. Install the plugin onto your vencord client,
2. Click the button that says "FLAGGED!" next to your username,
3. Depending on what service you're flagged on, appeal with their respective appeals system,
4. Once your appeal has been accepted and you should no longer be flagged on any of the systems, simply go back to your discord profile, press the "FLAGGED!" button again, and press "Click here to check!" in order to requeue yourself and remove the flagged status from your profile.

Step 4 can also be used in order to check whether or not you are flagged on any of the three systems.

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