SERVANT DATA SPEC:

    RARITY LIST: Object. Members:
    
        "list_id": String. Possible values: "ssr", "sr", "rare", "uncommon", "common", "none"
        
        "list_name": String.
        
        "list_element": String. Matching elements from HTML. Possible values: "ssrBox", "srBox", "rareBox", "uncommonBox", "commonBox", "noneBox"
        
        "list_iconpath": ??? (Potentially used for specific rarity icons, though this game emphasizes class icons.)
        
        "class_available": String array. Contains the available classes in this rarity. Currently set to ["saber","archer","lancer","rider","caster","assassin","berserker","ruler","avenger","mooncancer","alterego","foreigner","pretender"],
        
        "disable": Boolean.
        
        "list": Object array. Object members:
        
            "id": String. Uses specific incrementing enumeration scheme: [Rarity-InternalID]. InternalID is X0-9, XA-Z, Xa-z, where X is a value between (null-0-9A-Za-z).
            
            "name": String.
            
            "class": String. Refer to array of classes in parent object.
            
            "game_id": Stringified integer.
            
            "maxcopy": 5. (Constant value).
            
            "stype": Integer. Values are: 0 = Normal, 1 = Mash, 2 = Storylocked, 3 = Limited, 4 = Welfare
            
            "img": true. (Constant value.)
            
            "imgpath": String. Path to imgur file.
