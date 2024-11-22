const Config = {
    // GENERAL/GLOBAL CONFIG VALUES/PARAMETERS {
    // File-related configs and specs
    icontype: ".png",
    icondefault: "default.png",
    icondefault_external_source: false,
    datapath: "data/servants.json",
    datapath_alternate: "data/servants.alternate.json",
    dataclasspath: "data/servantsclass.json",
    img_path: "img/servants/",

    img_CSSclass: "img-fluid",
    member_grid_CSSclass: "col-1 member-outer",
    member_container_CSSclass: "member-container",
    member_owned_CSSclass: "member-checked",
    member_wishlist_CSSclass: "member-wishlist",

    capture_area: "capturearea",
    box_fake_suffix: "Fake",

    // Copies config
    additional_copies_text: "",
    additional_copies_CSSclass: "member-np",
    additional_copies_prefix: "np_",
    copy_choice_allow: [
        { id:  0, text: "Not currently owned", badge: " " },
        { id:  1, text: "NP1", badge: " " },
        { id:  2, text: "NP2", badge: "NP2" },
        { id:  3, text: "NP3", badge: "NP3" },
        { id:  4, text: "NP4", badge: "NP4" },
        { id:  5, text: "NP5", badge: "NP5" }
    ],
    wishlist_copies_text: "",
    wishlist_copies_prefix: "wl_",
    wishlist_choice_allow: [
        { id:  0, text: "Not wishlisted", badge: " " },
        { id:  1, text: "1 copy wishlisted", badge: "WL1" },
        { id:  2, text: "2 copies wishlisted", badge: "WL2" },
        { id:  3, text: "3 copies wishlisted", badge: "WL3" },
        { id:  4, text: "4 copies wishlisted", badge: "WL4" },
        { id:  5, text: "5 copies wishlisted", badge: "WL5" },
        { id:  6, text: "6 copies wishlisted", badge: "WL6" },
        { id:  7, text: "7 copies wishlisted", badge: "WL7" },
        { id:  8, text: "8 copies wishlisted", badge: "WL8" },
        { id:  9, text: "9 copies wishlisted", badge: "WL9" }
    ],
    copy_choice_default: 0,
    copy_choice_max: 5,
    wishlist_choice_default: 0,
    wishlist_choice_max: 9,

    share_tags: "FGO,FateGrandOrder,My_FGO_Checklist",
    share_title: "See my Servant collection here!",

    // Class-based CSS classes config
    class_divide_CSSclass: "ByClass",
    class_div_icon_CSSclass: "col-1 class_icon_box",
    class_div_list_CSSclass: "col",
    class_img_path: "img/classes/",

    // Class-based counters config
    class_count_have: "class_have_",
    class_count_max: "class_max_",

    // Servant Types config
    servant_type_box_class: "member-type",
    servant_typelist: [
        { id: 0, "show": false, "eventonly": false, "ctext": null,
            "class": null }, // Default
        { id: 1, "show": true, "eventonly": false,
            "ctext": '<i class="fas fa-shield-alt"></i>',
            "class": "member-mash" }, // Mash
        { id: 2, "show": true, "eventonly": false,
            "ctext": '<i class="fas fa-lock"></i>',
            "class": "member-locked" }, // Storylocked
        { id: 3, "show": true, "eventonly": false,
            "ctext": '<i class="fas fa-star"></i>',
            "class": "member-limited" }, // Limited
        { id: 4, "show": true, "eventonly": true,
            "ctext": '<i class="fas fa-gift"></i>',
            "class": "member-eventonly" } // Welfare
    ],

    // Confirm strings
    member_uncheck_conf: "Are you sure you want to uncheck this Servant?",
    member_clear_conf: "Are you sure you want to clear all checked Servants?",

    // Share strings
    share_text: "This is your shortened URL for easy sharing:",
    share_none_text: "There is nothing to share.",

    // "Select All" Text
    select_all_text: "This will not affect already selected Servants. " +
        "However, <b><i>THIS CHANGE CANNOT BE REVERTED</i></b>.<br><br>Are " +
        "you sure you want to continue?",

    // Statistics
    statistic_area: "statisticBox",

    // Parameters
    raw_input_parameter: "raw",
    compress_input_parameter: "pak",
    fastmode_checkbox: "fastmode",
    fastmode_parameter: "fast",

    classmode_checkbox: "classmode",
    classmode_parameter: "classlist",

    mashSR_checkbox: "mashSR",
    mashSR_parameter: "mash",

    fast_mode_local: "fgo_fastmode",
    class_mode_local: "fgo_classmode",
    mashSR_local: "fgo_mash",
    NAonly_local: "fgo_naonly",
    
    // Data, Save & Load
    list_local: "fgo_list",

    load_text:
        "List data found on your current browser. Would you like to load it?",
    save_text: "Would you like to save current list data? This will " +
        "overwrite old data if it exists.",

    load_fin_text: "List loaded successfully.",
    save_fin_text: "List saved successfully.",

    load_fail_text: "Error loading data or unsupported file. Please check " +
        "your selected file and try again.",

    load_btn: "loadbutton",
    save_btn: "savebutton",

    file_hidden_id: "theFile",
    save_file_btn: "savebutton_f",
    save_file_text: "Would you like to save the current list data?",

    export_header: "thisisfgochecklist_data",
    export_header_separator: ":",
    export_filename: (function() {
        const now = new Date();
        const pad = (num) => String(num).padStart(2, '0');
        const YYYY = String(now.getFullYear());
        const MM = pad(now.getMonth() + 1);
        const DD = pad(now.getDate());
        const HH = pad(now.getHours());
        const mm = pad(now.getMinutes());
        const SS = pad(now.getSeconds());
        return `fgo_checklist_${YYYY}${MM}${DD}${HH}${mm}${SS}.fgol`;
    })(),

    // Global Variables
    servants_data_list: {},
    class_data_list: {},
    user_data: {},

    encoded_user_input: "",
    compress_input: "",

    current_edit: "",
    current_edit_ele: null,

    jump_to_target: null,

    // Global Objects
    custom_adapter: null,
    list_new: null,
    list_update: null,
    wishlist_new: null,
    wishlist_update: null,
    
    threshold_error: "Unable to get the NA threshold, JP-only Servants " +
    "will not be able to be hidden.",
    NAonly_parameter: "NA",
    NAonly_checkbox: "NAonly",
    globalThreshold: 99999,
    
    webAppVersion: "20241121",

    padorus: [
        "padoru-nero"
        //,""
    ],
    padoruStartMonth: 10, padoruStartDay: 28,   //  Before Nov 28
    padoruEndMonth: 0, padoruEndDay: 3,         //  After Jan 3
    // }
};

Config.cookieName = `${Config.webAppVersion}_notice`;