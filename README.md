~~~
~~~~~~ Disclaimer! ~~~~~~

DO NOT use this plugin to harass, make fun of, or attack anyone.
The Terms of Service/Terms of Use of all three systems apply, and will be listed right here:

Detective Okappiki: https://okappiki.com/terms-of-use
Rotector: https://rotector.com/terms
Mococo (TASE): https://moco-co.org/terms

Violation of any of the Terms of Use/Terms of Service(s) will result in your access to the plugin being revoked, with your Discord ID being blacklisted server-side, meaning you won't be able to change it by editing it in your DORM's code.

~~~~~~ Intro ~~~~~~

Detective Okappiki Rotector Mococo, in short DORM is a plugin developed by the creator of the Discord Bot known as "Detective Okappiki", DullBrad (https://okappiki.com/)

All the credits regarding the TASE/Mococo and Rotector APIs go to their respective creators, Doqe (slopisekai) https://slop.isekai.fyi/ and jaxron (robalyx) https://rotector.com/ .

The plugin has been made for Vencord (https://vencord.dev/) and only works alongside their directory as is normal for any and all user plugins for Vencord.

~~~~~~ Features ~~~~~~

The plugin allows you to view someone's DORM flag status, which is purely based on whether or not their Discord ID is flagged on either Detective Okappiki, Rotector or Mococo (TASE).

The text "NOT FLAGGED!" will appear next to someone's username both in chat and on their profile, both popout and main. The "NOT FLAGGED!" badge is clickable in all the places it appears in, and it'll send you to a modal popout which will then allow you to queue them for a flag on all three.

The FLAGS themselves do not get stored, however the fact that someone is, at the time of the check, flagged, does. This ensures that flags persist without scraping/collecting any of the data from Detective Okappiki, Rotector OR Mococo (TASE), minus the necessary boolean flag status.

So, for example, if I were to go into a discord chat and if then I clicked "NOT FLAGGED!" and "Click here to check!" the plugin itself would send a request to the https://okappiki.com/ website, in turn passing the Discord ID of the person you are checking through all three systems twice, temporarily storing their roblox data in order to ensure the most accurate data is outputted, after which it'd display the flag reasons, what they're flagged on (along with an appeal link to the system) and update their status to "FLAGGED!".

~~~~~~ How to use ~~~~~~

In order to correctly use the plugin, you can't simply assume that everyone with "NOT FLAGGED!" is a safe user. "NOT FLAGGED!" can mean one of two things.

1. The person hasn't been checked via the plugin yet,
2. The person isn't flagged in general.

In order to check which one is correct, you should always check someone you are talking to, as it will not only help YOU ease your mind, but in a scenario that they are flagged, it will improve the plugin itself by updating our record on that person.

~~~~~~ Appealing ~~~~~~

If you've found yourself to be flagged or were alerted of being flagged then you can appeal by following these x steps:

1. Install the plugin onto your vencord client,
2. Click the button that says "FLAGGED!" next to your username,
3. Depending on what service you're flagged on, appeal with their respective appeals system,
4. Once your appeal has been accepted and you should no longer be flagged on any of the systems, simply go back to your discord profile, press the "FLAGGED!" button again, and press "Click here to check!" in order to requeue yourself and remove the flagged status from your profile.

Step 4 can also be used in order to check whether or not you are flagged on any of the three systems.

~~~~~~ Installing ~~~~~~

Installing the DORM plugin is simple, and requires very little actual Vencord/PC knowledge.

1. Follow this guide: https://docs.vencord.dev/installing/ ,
2. Follow this guide: https://docs.vencord.dev/installing/custom-plugins/ ,
3. Once you've done that, place the detectiveOkappikiRotectorMococo folder inside of your src/userplugins folder.

This guide will branch off depending on whether or not you use Linux, Windows or macOS.

~~~~~~ Windows ~~~~~~

If you're on Windows and you put your Vencord repository into the /Documents folder, you should open PowerShell (or whatever terminal you use) and run:

cd C:\Users\PC\Documents\Vencord
pnpm build
pnpm inject

Then press enter on prompt.

After restarting your Discord it should be available in the plugin section of vencord under the name "DORM".


!!!!!!! DISCLAIMER !!!!!!!

If your path is different just change the first command to that path!

If you get an "File pnpm.ps1 cannot be loaded because running scripts is disabled on this system." erorr in powershell, simply run Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser .

!!!!!!! DISCLAIMER !!!!!!!

~~~~~~ Linux/macOS ~~~~~~

If you are on Linux or Mac, open your terminal and input these commands:

cd ~/Documents/Vencord
pnpm build
pnpm inject

Then press enter on prompt.

After restarting your Discord it should be available in the plugin section of vencord under the name "DORM".


!!!!!!! DISCLAIMER !!!!!!!

If your path is different just change the first command to that path!

!!!!!!! DISCLAIMER !!!!!!!

~~~~~~ Credits ~~~~~~

Plugin maker: DullBrad
Detective Okappiki Creator: DullBrad
Rotector Creator: jaxron (robalyx)
Mococo (TASE) Creator: doqe (slopisekai)

~~~~~~ The End ~~~~~~
