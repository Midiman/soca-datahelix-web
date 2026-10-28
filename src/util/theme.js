import { Debug } from '@/util/Utilities';

var globalTheme = 'light';

export function GetSelectedTheme() 
{
    if (Debug)
        console.log("APP [exported] getTheme() : " + globalTheme);
    return globalTheme;
}

export function SetSelectedTheme(name) 
{
    globalTheme = name;
    if (Debug)
        console.log("APP [exported] setTheme() : " + globalTheme);
}
