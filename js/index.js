// Config
var icontype = ".png";
var icondefault = "default.png";
var icondefault_external_source = false;

var datapath = "data/servants.json";
var datapath_alternate = "data/servants.alternate.json";
var dataclasspath = "data/servantsclass.json";

var img_path = "img/servants/";
var img_class = "img-fluid";
var image_host = "https://i.imgur.com/";
var member_class_grid = "col-1 member-outer";
var member_class = "member-container";
var member_class_checked = "member-checked";
var capture_area = "capturearea";
var box_fake_subfix = "Fake";

var morecopy_text = "NP";
var morecopy_class = "member-np";
var morecopy_prefix = "np_";
var copy_choice_allow = [
    { "id": 1, "text": "NP1" },
    { "id": 2, "text": "NP2" },
    { "id": 3, "text": "NP3" },
    { "id": 4, "text": "NP4" },
    { "id": 5, "text": "NP5" }
];
var copy_choice_default = 1;
var copy_choice_max = 5;
var share_tags = "FGO,FateGrandOrder";
var share_title = "See my Servants here!";

// Class Config
var class_divide_class = "ByClass";
var class_div_icon_class = "col-1 class_icon_box";
var class_div_list_class = "col";
var class_img_path = "img/classes/";

var class_count_have = "class_have_";
var class_count_max = "class_max_";

// Servant Type
var servant_type_box_class = "member-type";
var sevent_typelist = [
    { "id": 0, "show": false, "eventonly": false, "ctext": null, "class": null }, // Default
    { "id": 1, "show": true, "eventonly": false, "ctext": '<i class="fas fa-shield-alt"></i>', "class": "member-mashu" }, // Mash
    { "id": 2, "show": true, "eventonly": false, "ctext": '<i class="fas fa-lock"></i>', "class": "member-locked" }, // Storylocked
    { "id": 3, "show": true, "eventonly": false, "ctext": '<i class="fas fa-star"></i>', "class": "member-limited" }, // Limited
    { "id": 4, "show": true, "eventonly": true, "ctext": '<i class="fas fa-gift"></i>', "class": "member-eventonly" } // Welfare
];

// Confirm
var member_uncheck_conf = "Are you sure you want to uncheck this Servant?";
var member_clear_conf = "Are you sure you want to clear all checked Servants?";

// Share
var share_text = "This is your current shortened URL:";
var share_none_text = "There is nothing to share.";

// Select Text
var select_all_text = "This will not affect already selected Servants. However, <b><i>THIS CHANGE CANNOT BE REVERTED</i></b>.<br><br>Are you sure you want to continue?";

// Statistic
var statistic_area = "statisticBox";

// Parameters
var raw_input_parameter = "raw";
var compress_input_parameter = "pak";
var short_input_parameter = "skey";
var fastmode_checkbox = "fastmode";
var fastmode_parameter = "fast";

var classmode_checkbox = "classmode";
var classmode_parameter = "classlist";

var mashuSR_checkbox = "mashuSR";
var mashuSR_parameter = getMashParameter() || "mash";

// Save & Load
var fast_mode_local = "fgo_fastmode";
var class_mode_local = "fgo_classmode";
var mashuSR_local = "fgo_mashu";

var list_local = "fgo_list";

var load_text = "List data found on your current browser. Would you like to load it?";
var save_text = "Would you like to save current list data? This will overwrite old data if it exists.";

var load_fin_text = "List loaded";
var save_fin_text = "List saved";

var load_fail_text = "Error loading data";

var load_btn = "loadbutton";
var save_btn = "savebutton";

var file_hidden_id = "theFile";
var save_file_btn = "savebutton_f";
var save_file_text = "Would you like to save the current list data?";

var export_header = "thisisfgochecklist_data";
var export_header_separator = ":";
var export_filename = (() => {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const YYYY = String(now.getFullYear());
    const MM = pad(now.getMonth() + 1);
    const DD = pad(now.getDate());
    const HH = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const SS = pad(now.getSeconds());
    return `fgo_checklist_${YYYY}${MM}${DD}${HH}${mm}${SS}.fgol`;
})();

// Global Variables
var servants_data_list = {};
var class_data_list = {};
var user_data = {};
var rarity_count_data = {
    "allcount": {
        "max": 0,
        "have": 0,
        "list": {}
    },
    "noteventcount": {
        "max": 0,
        "have": 0,
        "list": {}
    }
};
var raw_user_input = "";
var compress_input = "";

var current_edit = "";
var current_edit_ele = null;

var own_data = {};
var own_data_eachclass = {};

var own_data_notevent = {};
var own_data_eachclass_notevent = {};

var max_data_eachclass = {};

var jump_to_target = null;

// Global Objects
var custom_adapter = null;
var list_new = null;
var list_update = null;
var existing_hash = null;

// Set Up
$.ajaxSetup({
    beforeSend: function(xhr) {
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("application/json");
        }
    }
});

$.fn.select2.amd.define('select2/data/customAdapter', ['select2/data/array', 'select2/utils'],
    function (ArrayAdapter, Utils) {
        function CustomDataAdapter ($element, options) {
             CustomDataAdapter.__super__.constructor.call(this, $element, options);
        }
        Utils.Extend(CustomDataAdapter, ArrayAdapter);
        CustomDataAdapter.prototype.updateOptions = function (data) {
            this.$element.find('option').remove();
            this.addOptions(this.convertToOptions(data));
        }        
        return CustomDataAdapter;
    }
);

function jumpTo(){
    if (jump_to_target === null) {
        return;
    }
    document.getElementById(jump_to_target).scrollIntoView();   // Even IE6 supports this
    jump_to_target = null; 
}

function orderKeys(not_sorted) {
  var sorted = Object.keys(not_sorted)
    .sort()
    .reduce(function (acc, key) { 
        acc[key] = not_sorted[key];
        return acc;
    }, {});
    return sorted;
}

// For Image Load
function loadSprite(src) {
    var deferred = $.Deferred();
    var sprite = new Image();
    sprite.onload = function() {
        deferred.resolve();
    };
    sprite.src = src;
    return deferred.promise();
}

// TODO: What is this for?
// Select2 Source for lower
function getNewCopySource(current_max, s_list) {
    if (current_max < copy_choice_max && current_max > 0) {
        var new_choice_allow = [];
        for (var i = 0; i < copy_choice_allow.length; i++) {
            if (copy_choice_allow[i].id <= current_max) {
                new_choice_allow.push(copy_choice_allow[i]);
            } else { break; }
        }
        s_list.data('select2').dataAdapter.updateOptions(new_choice_allow);
    } else {
        s_list.data('select2').dataAdapter.updateOptions(copy_choice_allow);
    }
}

// For Image Part
function getImagePath(path, external_source) {
    if (external_source) {
        return path;
    } else {
        var urlBase = location.href.substring(0, location.href.lastIndexOf("/") + 1);
        return urlBase + img_path + path;
    }
}

function getImageClassPath(path) {
    var urlBase = location.href.substring(0, location.href.lastIndexOf("/") + 1);
    return urlBase + class_img_path + path;
}

// User Data Check
function getUserData(id) {
    if (typeof user_data[id] === "undefined") {
        return null;
    }
    return user_data[id];
}

// Convert Data
function convertUserDataToRawInput(input_data)
{
    var new_raw_input = "";
    for (var key in input_data) {
        if (input_data.hasOwnProperty(key)) {
            var current_user_data = input_data[key];
            new_raw_input += key + ">" + current_user_data + ",";
        }
    }
    new_raw_input = new_raw_input.slice(0, -1);
    return new_raw_input;
}

function isFastMode() { return $('#' + fastmode_checkbox).is(':checked'); } // FastMode Check

function isClassMode() { return $('#' + classmode_checkbox).is(':checked'); } // ClassMode Check

function isMashuSR() { return $('#' + mashuSR_checkbox).is(':checked'); } // ClassMode Check

function executeUserDataRemoval(id) { delete user_data[id]; }

function getFastModeURLstring() { return isFastMode() ? fastmode_parameter + "=1" : ""; }

function getClassModeURLstring() { return isClassMode() ? classmode_parameter + "=1" : ""; }

function getCompressedInput() { return compress_input + (getMashuSRURLstring(false) ? "&" + MashuIsSR : ''); } // Get compress_input

function updateClassMode() { updateURLOptionModeOnly(); finishLoading(); } // Class Mode Change

function openFileOption() { document.getElementById(file_hidden_id).click(); }



// Validate old param and convert to new if existing; ensures compatibility with legacy 'mashu'
function getMashParameter() {
    var urlParams = new URLSearchParams(window.location.search);
    var mashValue = urlParams.get("mash") || urlParams.get("mashu");

    if (mashValue !== null) {
        // Update the parameter to the new standard 'mash' if it's 'mashu'
        if (urlParams.has("mashu")) {
            urlParams.delete("mashu");
            urlParams.set("mash", mashValue);
            // Update the URL without reloading the page
            window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
        }
    }
    return mashValue;
}


// Click Div
function elementLeftClick(s_element) {
    // Variable
    var id = $(s_element).attr("id");
    var name = $(s_element).data("original-title");
    // Fast Mode, Change Value Directly
    if (isFastMode()) {
        updateUserDataFast(id, 1, s_element); // Change Value
        return; // Stop
    }
    // Mark current_edit
    current_edit = id;
    current_edit_ele = s_element;
    var current_user_data = getUserData(id);
    var current_edit_max = servants_data_list[id].maxcopy;
    // New Check or Update
    if (current_user_data != null) {
        getNewCopySource(current_edit_max, list_update); // Select 2
        $('#nameUpdate').html(name); // Update Modal String
        $('#npUpdate').val(current_user_data).trigger('change'); // Reset Modal Choice to Current
        $('#updateModal').modal('show'); // Show Update Check Modal
    } else {
        getNewCopySource(current_edit_max, list_new); // Select 2
        $('#nameAdd').html(name); // Update Modal String
        $('#npAdd').val(copy_choice_default).trigger('change'); // Reset Modal Choice to Default
        $('#addModal').modal('show'); // Show New Check Modal
    }
}

// Click Div
function elementRightClick(s_element) {
    if (!isFastMode()) { return; } // Fast Mode, Change Value Directly
    // Variable
    var id = $(s_element).attr("id");
    var name = $(s_element).data("original-title");
    updateUserDataFast(id, -1, s_element); // Mark current_edit
}


function removeUserData() {
    if (current_edit == "" || current_edit_ele == null) { return; } // Prevent Blank Key
    bootbox.confirm({ // Confirm
        message: member_uncheck_conf,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
                var current_user_data = getUserData(current_edit); // Get UserData
                if (current_user_data != null) { executeUserDataRemoval(current_edit); } // Delete User Data
                updateCounts(current_edit, -1, true); // Update Count
                $('#' + current_edit).removeClass(member_class_checked); // Update Member Element
                updateCopyValue(current_edit, 0, current_edit_ele); // Update Value on List
                $('#updateModal').modal('hide'); // Hide Update Check Modal
                updateStatisticsHTML();
                updateURL();
                current_edit = ""; // clear current_edit
            }
        }
    });
}

function updateCounts(id, val, showloading) {
    const servant = servants_data_list[id];
    const { eventonly, class: servantClass, key } = servant;

    // Initialize data structures if not present
    if (!(key in own_data)) {
        own_data[key] = [];
        own_data_eachclass[key] = {};
        own_data_notevent[key] = [];
        own_data_eachclass_notevent[key] = {};
    }
    if (!(servantClass in own_data_eachclass[key])) {
        own_data_eachclass[key][servantClass] = [];
        own_data_eachclass_notevent[key][servantClass] = [];
    }
    const updateList = (list, id, add) => {
        if (add) { list.push(id); } else { list = list.filter(item => item !== id); }
        return list;
    };
    // Update count
    const add = val !== -1;
    own_data[key] = updateList(own_data[key], id, add);
    own_data_eachclass[key][servantClass] = updateList(own_data_eachclass[key][servantClass], id, add);
    if (!eventonly) {
        own_data_notevent[key] = updateList(own_data_notevent[key], id, add);
        own_data_eachclass_notevent[key][servantClass] = updateList(own_data_eachclass_notevent[key][servantClass], id, add);
    }
}


function updateUserDataFast(id, val, s_element) {
    // Mark current_edit
    var current_user_data = getUserData(id);
    var current_edit_max = servants_data_list[id].maxcopy;
    if (current_edit_max > copy_choice_max) { current_edit_max = copy_choice_max; } // Prevent Over Data

    // New Check or Update
    if (current_user_data != null) {
        var new_val = current_user_data + val; // Get New Value
        if (new_val <= 0 || new_val > current_edit_max) {
            // Remove Instead
            $(s_element).removeClass(member_class_checked); // Update Member Element
            updateCopyValue(id, 0, s_element); // Update Value on List
            updateCounts(id, -1, true); // Update Count
            executeUserDataRemoval(id); // Clear Number
        } else {
            user_data[id] = new_val; // Update user data
            updateCopyValue(id, new_val, s_element); // Update Value on List
        }
    } else {
        if (val <= 0) {
            user_data[id] = current_edit_max; // Add user data
            $(s_element).addClass(member_class_checked); // Update Member Element
            updateCopyValue(id, user_data[id], s_element); // Update Value on List
            updateCounts(id, 1, true); // Update Count
        } else {
            user_data[id] = 1; // Add user data
            updateCounts(id, 1, true); // Update Count
            $(s_element).addClass(member_class_checked); // Update Member Element
        }
    }
    updateStatisticsHTML();
    updateURL();
}

function updateUserData() {
    if (current_edit == "" || current_edit_ele == null) { return; } // Prevent Blank Key
    var current_user_data = getUserData(current_edit); // Get UserData
    // New Check or Update
    if (current_user_data != null) {
        var new_val = parseInt($('#npUpdate').val()); // Get New Value
        user_data[current_edit] = new_val; // Update user data
        updateCopyValue(current_edit, new_val, current_edit_ele); // Update Value on List
        $('#updateModal').modal('hide'); // Hide Update Check Modal
    } else {
        var current_edit_eventonly = servants_data_list[current_edit].eventonly; // Get Event
        var new_val = parseInt($('#npAdd').val()); // Get New Value
        user_data[current_edit] = new_val; // Add user data
        updateCounts(current_edit, 1, true); // Update Count
        $('#' + current_edit).addClass(member_class_checked); // Update Member Element
        updateCopyValue(current_edit, new_val, current_edit_ele); // Update Value on List
        $('#addModal').modal('hide'); // Hide New Check Modal
    }
    updateStatisticsHTML();
    updateURL();
    current_edit = ""; // Clear current edit
}

// TODO: What is this used for?
function updateCopyValue(id, new_val, s_element) {
    if (!id) { return; }
    const content = new_val > 1 ? morecopy_text + new_val : "";
    $(s_element).find(`#${morecopy_prefix}${id}`).html(content);
}


function getMashuSRURLstring(allowZero) {
    return isMashuSR() ? 
        `${mashuSR_parameter}=1` : 
        (allowZero ? `${mashuSR_parameter}=0` : "");
}


function updateURL() {
    // Sort keys and update raw input
    user_data = orderKeys(user_data);
    raw_user_input = convertUserDataToRawInput(user_data);
    let new_parameter = ""; // Initialize new parameter
    // Compress user data and update buttons
    if (raw_user_input) {
        compress_input = LZString.compressToEncodedURIComponent(raw_user_input);
        new_parameter = `?${compress_input_parameter}=${compress_input}`;
        $('#' + save_btn).prop('disabled', false);
        $('#' + save_file_btn).prop('disabled', false);
    } else {
        compress_input = null;
        $('#' + save_btn).prop('disabled', true);
        $('#' + save_file_btn).prop('disabled', true);
    }
    // Add additional parameters
    [getMashuSRURLstring(false), getClassModeURLstring(), getFastModeURLstring()].forEach(param => {
        if (param) { new_parameter += (new_parameter.includes("?") ? "&" : "?") + param; }
    });
    // Update URL
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${new_parameter}`;
    window.history.pushState({ path: newurl }, '', newurl);
    existing_hash = null; // Clear existing hash
    return true;
}

function updateURLOptionModeOnly() {
    const urlParams = new URLSearchParams(window.location.search);
    const options = [
        { key: mashuSR_parameter, value: getMashuSRURLstring(false), storageKey: mashuSR_local },
        { key: classmode_parameter, value: getClassModeURLstring(), storageKey: class_mode_local },
        { key: fastmode_parameter, value: getFastModeURLstring(), storageKey: fast_mode_local }
    ];
    options.forEach(({ key, value, storageKey }) => {
        if (value) {
            urlParams.set(key, value.slice(1));  // Remove '=' from value
            localStorage[storageKey] = 1;
        } else {
            urlParams.delete(key);
            localStorage[storageKey] = 0;
        }
    });
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
}


// Make Data
function buildServantData(servants_data) {
    $('[data-toggle="tooltip-member"]').tooltip('dispose'); // Clear tooltip
    $( ".listbox" ).html(""); // Clear contents
    $( ".listbox_class" ).html(""); // Clear contents
    
    // Reset Values
    rarity_count_data.allcount.max = 0;
    rarity_count_data.noteventcount.max = 0;
    own_data = {};
    own_data_eachclass = {};
    own_data_notevent = {};
    own_data_eachclass_notevent = {};
    
    // Draw Button & Create User Data
    var list_box = [];
    var list_img = [];
    
    // Add Default Photo
    var img_default = getImagePath(icondefault, icondefault_external_source);
    list_img.push(loadSprite(img_default));
    
    // Loop
    for (var aa = 0, ll = servants_data.length; aa < ll; aa++) {
        // list get
        var current_rarity = servants_data[aa];
        var current_key = current_rarity.list_id;
        // Skip if Disable
        if (current_rarity.disable) { continue; }
        // Count Data Prepare
        var tem_list = current_rarity.list.filter(function(item) {
            var current_servant_type = sevent_typelist[item.stype];
            return !current_servant_type.eventonly;
        });
        rarity_count_data.allcount.list[current_key] = {
            "list_element": current_rarity.list_element,
            "max": current_rarity.list.length
        };
        rarity_count_data.allcount.max += current_rarity.list.length;
        rarity_count_data.noteventcount.list[current_key] = {
            "list_element": current_rarity.list_element,
            "max": tem_list.length
        };
        rarity_count_data.noteventcount.max += tem_list.length;
        // Prepare Var for Member Loop
        var current_list = current_rarity.list;
        var current_element = "#" + current_rarity.list_element;
        var current_path = current_rarity.list_iconpath;
        list_box.push(current_element);
        if (isClassMode()) { // Class Mode; Prepare Element
            var list_class_available = current_rarity.class_available;
            var current_class_html = "";
            for (var bb = 0, bb_s = list_class_available.length; bb < bb_s; bb++) {
                var current_class = list_class_available[bb]; // Class Var
                if (typeof max_data_eachclass[current_key] === "undefined") { max_data_eachclass[current_key] = {}; } // Make Max Data
                max_data_eachclass[current_key][current_class] = 0;
                
                // Prepare Div
                current_class_html += '<div class="row" id="' + current_key + "_" + current_class + '">';
                current_class_html += '<div class="' + class_div_icon_class + '" style="text-align: center">';
                
                // Class Icon
                var current_class_data = class_data_list[current_class];
                var current_class_data_icn = getImageClassPath(current_class_data.iconlist[current_rarity.list_id]);
                list_img.push(loadSprite(current_class_data_icn));
                var current_class_data_icn_ele = '<img src="' + current_class_data_icn + '" class="' + img_class + '" title="' + current_class_data.name + '" data-toggle="tooltip-member" data-placement="bottom"/>';
                current_class_html += current_class_data_icn_ele;
                
                // Class  Basic Count
                current_class_html += "<div>";
                current_class_html += '<span id="' + class_count_have + current_key + "_" + current_class + '">0</span>/'
                current_class_html += '<span id="' + class_count_max + current_key + "_" + current_class + '">0</span>'
                current_class_html += "</div>";
                
                // All + None Button
                current_class_html += '<button type="button" class="btn btn-outline-primary btn-xs" onclick="SelectAllData(false, ' + "'" + 
                    current_key + "', '" + current_class + "'" +')">All</button>';
                current_class_html += '<button type="button" class="btn btn-outline-danger btn-xs" onclick="SelectAllData(true, ' +  "'" + 
                    current_key + "', '"+ current_class + "'" +')">None</button>'
                
                current_class_html += "</div>";
                current_class_html += '<div class="row ' + class_div_list_class + '" id="' + current_rarity.list_element + '_' + current_class + '">';
                current_class_html += "</div>";
                current_class_html += "</div>";
                current_class_html += "<hr />";
                
            }
            $(current_element + "-" + class_divide_class).html(current_class_html); // Update List Div
        }

        // Loop List
        for (var i = 0, l = current_list.length; i < l; i++) {
            // Get Data
            var current_servant = current_list[i];
            var current_type = sevent_typelist[current_servant.stype];
            servants_data_list[current_servant.id] = current_list[i];
            servants_data_list[current_servant.id].key = current_key;
            servants_data_list[current_servant.id].class = current_servant.class;
            servants_data_list[current_servant.id].eventonly = current_type.eventonly; 
            // Prepare
            var current_user_data = getUserData(current_servant.id);
            var current_servant_html = '<div class="' + member_class_grid + '"><div';
            var current_servant_class = ' class="' + member_class;
            var current_servant_img = '';
            if (isClassMode()) { max_data_eachclass[current_key][current_servant.class] += 1; } // Count Data: All
            if (current_user_data != null) { updateCounts(current_servant.id, 1, false); } // Update Real Count Data
            
            // Create Servant Element
            current_servant_html += ' id="' + current_servant.id + '" title="' + current_servant.name + '"';
            current_servant_html += ' data-toggle="tooltip-member" data-placement="bottom"';
            // Class
            if (current_user_data != null) { current_servant_class += ' ' + member_class_checked; }
            current_servant_html += current_servant_class + '"';
            current_servant_html += '>'; // Close div open tags
            // Image
            if (current_servant.img == false) {
                current_servant_img = img_default;
            } else if (current_servant.imgpath == null) {
                current_servant_img = getImagePath(current_path + '/' + current_servant.id + icontype, false);
                list_img.push(loadSprite(current_servant_img));
            } else {
                current_servant_img = getImagePath(current_servant.imgpath, true);
                list_img.push(loadSprite(current_servant_img));
            }
            current_servant_html += '<img src="' + current_servant_img + '" class="' + img_class + '"/>';
            // Multiple Copy + Event Only Tag
            current_servant_html += '<div id="' + morecopy_prefix + current_servant.id + '" class="' + morecopy_class + '">';
            if (current_user_data != null) {
                if (current_user_data > 1) {
                    current_servant_html += morecopy_text + current_user_data.toString();
                }
            }
            current_servant_html += '</div>';
            if (current_type.show) {
                current_servant_html += '<div class="' + servant_type_box_class + ' ' + current_type.class + '">'
                current_servant_html += current_type.ctext + '</div>';
            }
            current_servant_html += '</div></div>'; // Close Element
            // Add to main list
            var item = $(current_servant_html);
            if (!isClassMode())
            {
                $(current_element).append(item);
                // Unbind then rebind Element 
                $(current_element).off("click", "#" + current_servant.id);
                $(current_element).off("contextmenu", "#" + current_servant.id);
                $(current_element).on("click", "#" + current_servant.id , function() {
                    elementLeftClick(this);
                });    
                $(current_element).on("contextmenu", "#" + current_servant.id , function() {
                    elementRightClick(this);
                    return false;
                });    
            } else {
                // Bind Element 
                $(current_element + '_' + current_servant["class"]).append(item);
                $(current_element + '_' + current_servant.class)
                    .on("click", "#" + current_servant.id , function() { elementLeftClick(this); });    
                $(current_element + '_' + current_servant.class)
                    .on("contextmenu", "#" + current_servant.id , function() { elementRightClick(this); return false; });    
            }
        }
    }
    // Refresh, Close Loading Modal
    $.when.apply(null, list_img).done(function() {
        for (var aa = 0, ll = list_box.length; aa < ll; aa++) {
            var current_box = list_box[aa];
            $(current_box + box_fake_subfix).hide();
            if (!isClassMode())
            {
                $(current_box).show();
                $(current_box + "-" + class_divide_class).hide();
            } else {
                $(current_box + "-" + class_divide_class).show();
                $(current_box).hide();
            }
        }
        updateStatisticsHTML();
        // ToolTip + Box
        $("#" + statistic_area).show();
        $('[data-toggle="tooltip-member"]').tooltip();
        $('#loadingModal').modal('hide');
        jumpTo();
    });
}

// Update Count HTML
function updateStatisticsHTML() {
    var all_base = 0; // Prepare Temp Int
    for (var key in own_data) {
        if (own_data.hasOwnProperty(key)) {
            all_base += own_data[key].length;
        }
    }
    var all_base_NotEvent = 0;
    for (var key in own_data_notevent) {
        if (own_data_notevent.hasOwnProperty(key)) {
            all_base_NotEvent += own_data_notevent[key].length;
        }
    }
    // All Rarity
    var AllPercent = Number(all_base / rarity_count_data.allcount.max * 100);
    $("#" + statistic_area + "AllMax").html(rarity_count_data.allcount.max);
    $("#" + statistic_area + "AllHave").html(all_base);
    $("#" + statistic_area + "AllPercent").html(parseFloat(Math.round(AllPercent * 100) / 100).toFixed(2));
    var NotEventPercent = Number(all_base_NotEvent / rarity_count_data.noteventcount.max * 100);
    $("#" + statistic_area + "NotEventMax").html(rarity_count_data.noteventcount.max);
    $("#" + statistic_area + "NotEventHave").html(all_base_NotEvent);
    $("#" + statistic_area + "NotEventPercent").html(parseFloat(Math.round(NotEventPercent * 100) / 100).toFixed(2));
    // Each Rarity
    for (var prop in rarity_count_data.allcount.list) {
        if(!rarity_count_data.allcount.list.hasOwnProperty(prop)) { continue; } // skip loop if the property is from prototype
        var rarity_base = 0; // Prepare Temp Int
        if (own_data.hasOwnProperty(prop)) { rarity_base = own_data[prop].length; }
        var rarity_base_NotEvent = 0;
        if (own_data_notevent.hasOwnProperty(prop)) { rarity_base_NotEvent = own_data_notevent[prop].length; }
        // all & notevent
        var r_allcount = rarity_count_data.allcount.list[prop];
        var r_AllPercent = Number(rarity_base / r_allcount.max * 100);
        $("#" + r_allcount.list_element + "AllMax").html(r_allcount.max);
        $("#" + r_allcount.list_element + "AllHave").html(rarity_base);
        $("#" + r_allcount.list_element + "AllPercent").html(parseFloat(Math.round(r_AllPercent * 100) / 100).toFixed(2));
        var r_noteventcount = rarity_count_data.noteventcount.list[prop];
        var r_NotEventPercent = Number(rarity_base_NotEvent / r_noteventcount.max * 100);
        $("#" + r_noteventcount.list_element + "NotEventMax").html(r_noteventcount.max);
        $("#" + r_noteventcount.list_element + "NotEventHave").html(rarity_base_NotEvent);
        $("#" + r_noteventcount.list_element + "NotEventPercent").html(parseFloat(Math.round(r_NotEventPercent * 100) / 100).toFixed(2));
    }
    // Class
    for (var curr_rare in max_data_eachclass) {
        for (var curr_class in max_data_eachclass[curr_rare]) {
            var curr_class_have = 0;
            if (own_data_eachclass.hasOwnProperty(curr_rare)) {
                if (own_data_eachclass[curr_rare].hasOwnProperty(curr_class)) {
                    curr_class_have = own_data_eachclass[curr_rare][curr_class].length;
                }
            }
            $("#" + class_count_have + curr_rare + "_" + curr_class).html(curr_class_have);
            $("#" + class_count_max + curr_rare + "_" + curr_class).html(max_data_eachclass[curr_rare][curr_class]);
        }
    }
}

// Clear
function clearAllData() {
    bootbox.confirm({ // Confirm
        message: member_clear_conf,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
                user_data = {}; // Clear User Data
                compress_input = ""; // Update Raw Input
                raw_user_input = "";
                finishLoading();
            }
        }
    });
}

// Export Canvas
function exportCanvasToImage() {
    bootbox.confirm({ // Confirm
        message: "WARNING: Image result will not look exactly like in the page. (Capture library issues.)<br/>It is recommendeded to share the link or use an external capture tool instead.<br/>Continue?",
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
                // Show Loading Modal
                $('#loadingModal').modal('show');
                html2canvas($('#' + capture_area)[0], { useCORS: true }).then(function(canvas) {
                    // canvas is the final rendered <canvas> element
                    var alink = document.createElement('a');
                    // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                    alink.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                    alink.download = 'fgo-checklist.jpg';
                    //Firefox requires the link to be in the body
                    document.body.appendChild(alink);
                    alink.click();
                    document.body.removeChild(alink); //remove the link when done
                    $('#loadingModal').modal('hide'); // Close Loading Modal
                });
            }
        }
    });
}

// Load
function loadLocalData() {
    bootbox.confirm({ // Confirm
        message: load_text,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
                $('#loadingModal').modal('show'); // Show Loading Modal
                loadDataDo(localStorage[list_local]); // Load List
            } else {
                if (raw_user_input == null)
                {
                    raw_user_input = ""; // Blank out raw input
                    finishLoading();
                }
            }
        }
    });
}

function saveLocalData() {
    updateURL(); // Update URL First
    if (compress_input == null) { return; } // Confirm if compress_input not null
    bootbox.confirm({ // Confirm 
        message: save_text,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
                localStorage[list_local] = compress_input;
                $('#' + load_btn).prop('disabled', false);
                bootbox.alert(save_fin_text, null);
            }
        }
    });
}


function loadLocalFile() {
    var input = document.getElementById(file_hidden_id);
     if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var getFile = reader.result;
            var n_txt = getFile.startsWith(export_header + export_header_separator);
            if (n_txt) {
                var res = getFile.replace(export_header + export_header_separator, "");
                return loadDataDo(res); 
            } else {
                // Alert
                return bootbox.alert(load_fail_text, null);
            }
        }
        reader.readAsText(input.files[0]);
    }
}

function loadDataDo(getresult) {
        // Clear User Data
        user_data = {};
        compress_input = "";
        raw_user_input = "";
        // Get Value
        compress_input = getresult;
        if (compress_input == null || compress_input == undefined) {
            compress_input = null
            bootbox.alert(load_fail_text, null);
            return;
        }
        // Get Raw
        raw_user_input = LZString.decompressFromEncodedURIComponent(compress_input);
        // Error; Stop
        if (raw_user_input == null || raw_user_input == undefined) {
            raw_user_input = null;
            bootbox.alert(load_fail_text, null);
            return;
        }
        finishLoading(); // Update HTML
        bootbox.alert(load_fin_text, null); // Alert
}

function saveLocalFile() {
    updateURL(); // Update URL First
    if (compress_input == null) { return; } // Confirm if compress_input not null
    bootbox.confirm({ // Confirm 
        message: save_text,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) { if (result) { saveLocalFileDo(compress_input); } }
    });
}

function saveLocalFileDo() {
    var blob = new Blob([export_header + export_header_separator + compress_input], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, export_filename);
}

// Onload
$(document).ready(function() {
    $('#loadingModal').modal('show'); // Show Loading Modal    
    // Load File Prepare
    $("#" + file_hidden_id).change(function(){
        loadLocalFile();
    });
    var urlParams = new URLSearchParams(window.location.search); // URL Params
    var local_hash = urlParams.get(short_input_parameter); // URL Redirect; New
    if (local_hash != null) {
        // New End Point
        $.getJSON(endpoint + url_data_part + local_hash, function (data) {
            data = data["result"];
            if (data != null) {
                var new_url = window.location.protocol + "//" + window.location.host + 
                window.location.pathname + "?" + compress_input_parameter + "=" + data;
                window.location.href = new_url; //Redirect
            } else {
                var new_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.location.href = new_url; //Redirect
            }
        });
        return;
    }
    // Prepare
    custom_adapter = $.fn.select2.amd.require('select2/data/customAdapter');
    $('[data-toggle="tooltip"]').tooltip();
    // Select2
    list_new = $( "#npAdd" ).select2({
        theme: "bootstrap",
        dataAdapter: custom_adapter,
        data: copy_choice_allow
    });
    list_update = $( "#npUpdate" ).select2({
        theme: "bootstrap",
        dataAdapter: custom_adapter,
        data: copy_choice_allow
    });
    var MashuSR_input = urlParams.get(mashuSR_parameter);
    var fastmode_input = urlParams.get(fastmode_parameter);
    var classmode_input = urlParams.get(classmode_parameter);
    compress_input = urlParams.get(compress_input_parameter);
    
    // Mashu is SR
    if (MashuSR_input != null) {
        var Mashu_IS_SR = (parseInt(MashuSR_input) > 0);
        $('#' + mashuSR_checkbox).prop('checked', Mashu_IS_SR);
    } else {
        // Mashu is SR
        if (localStorage[mashuSR_local]) {
            var Mashu_IS_SR = (parseInt(localStorage[mashuSR_local]) > 0);
            $('#' + mashuSR_checkbox).prop('checked', Mashu_IS_SR);
        }
    }
    
    // ClassMode
    if (classmode_input != null) {
        var classmode_enable = (parseInt(classmode_input) > 0);
        $('#' + classmode_checkbox).prop('checked', classmode_enable);
    } else {
        // ClassMode
        if (localStorage[class_mode_local]) {
            var classmode_enable = (parseInt(localStorage[class_mode_local]) > 0);
            $('#' + classmode_checkbox).prop('checked', classmode_enable);
        }
    }
    
    // FastMode
    if (fastmode_input != null) {
        var fastmode_enable = (parseInt(fastmode_input) > 0);
        $('#' + fastmode_checkbox).prop('checked', fastmode_enable);
    } else {
        // FastMode
        if (localStorage[fast_mode_local]) {
            var fastmode_enable = (parseInt(localStorage[fast_mode_local]) > 0);
            $('#' + fastmode_checkbox).prop('checked', fastmode_enable);
        }
    }
    
    // Load From URL
    if (compress_input != null) {
        // List Reader
        raw_user_input = LZString.decompressFromEncodedURIComponent(compress_input);
        // Finish Loading
        finishLoading();
    } else {
        raw_user_input = urlParams.get(raw_input_parameter);
        if (raw_user_input != null) {
            // Finish Loading
            finishLoading();
        } else {
            // List Reader
            if (localStorage[list_local]) {
                loadLocalData();
            } else {
                // Blank Raw
                raw_user_input = "";
                // Finish Loading
                finishLoading();
            }
        }
    }
    // Set Load Button Status
    if (localStorage[list_local]) {
        $('#' + load_btn).prop('disabled', false);
    }
    // Set Checkbox Event
    $('#' + fastmode_checkbox).change(function () { updateURLOptionModeOnly(); });
    $('#' + classmode_checkbox).change(function () { updateClassMode(); });
    $('#' + mashuSR_checkbox).change(function () { updateClassMode(); });
    
    // Set Modal Closing Event
    $("#addModal").on("hidden.bs.modal", function () {
        current_edit = "";
        current_edit_ele = null;
    });
    $("#updateModal").on("hidden.bs.modal", function () {
        current_edit = "";
        current_edit_ele = null;
    });
    
    try {
        var isFileSaverSupported = !!new Blob;
    } catch (e) {
        $("#loadbutton_f").prop("disabled", "disabled");
        $("#savebutton_f").prop("disabled", "disabled");
        $("#page_whatami").append("<br /><b>NOTICE:</b> FileSaver.js functionality not supported! Upload &amp; Download buttons have been disabled.");
    }
});

function markAllUnitsSelected(isRevert, input_rarity, input_class) {
    bootbox.confirm({ // Confirm 
        message: select_all_text,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
                executeMarkAllUnitsSelected(isRevert, input_rarity, input_class);
            }
        }
    });
}

function executeMarkAllUnitsSelected(isRevert, input_rarity, input_class) {   
    // Open Loading Modal
    $('#loadingModal').modal('show');
    
    // Ajax; Servant Data
    $.ajax({
        url: isMashuSR() ? datapath_alternate : datapath,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        beforeSend: function(xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        },
        success: function(result) {
            var servants_data = result;
            
            if (typeof input_rarity !== "undefined" && typeof input_class !== "undefined") {
                jump_to_target = input_rarity + "_" + input_class; // Create Jump Target
                var tem_list = servants_data.filter(function(item) { return item.list_id === input_rarity; }); // Make List
                var current_list = tem_list[0].list;
                for (var i = 0, l = current_list.length; i < l; i++) {    
                    var current_servant = current_list[i];
                    if (current_servant.class === input_class) {
                        if (isRevert) {
                            if (typeof user_data[current_servant.id] !== "undefined") { executeUserDataRemoval(current_servant.id); }
                        } else {
                            if (typeof user_data[current_servant.id] === "undefined") { user_data[current_servant.id] = 1; }
                        }
                    }
                }
            } else {
                // Update User Input 
                for (var aa = 0, ll = servants_data.length; aa < ll; aa++) {
                    // list get
                    var current_rarity = servants_data[aa];
                    var current_list = current_rarity.list;
                    for (var i = 0, l = current_list.length; i < l; i++) {
                        var current_servant = current_list[i];
                        if (isRevert) {
                            if (typeof user_data[current_servant.id] !== "undefined") { executeUserDataRemoval(current_servant.id); }
                        } else {
                            if (typeof user_data[current_servant.id] === "undefined") { user_data[current_servant.id] = 1; }
                        }
                    }
                }                
            }
            raw_user_input = null; // Clear Raw Input
            finishLoading(result); // Send to Finish
        },
        error: function(result) {
            alert("Error attempting to select all data!"); // Alert
            $('#loadingModal').modal('hide'); // Close Loading Modal
        }
    });
}

function finishLoading(servant_pass_data) {
    // Clear Contents
    $( ".listbox" ).hide();
    $( ".listbox_class" ).hide();
    $( ".listbox_fake" ).show();
        
    // Convert User Data from Input
    if (raw_user_input !== null)
    {
        var array_input = raw_user_input.split(",");
        for (var ii = 0, li = array_input.length; ii < li; ii++) {
            var current_split = array_input[ii].split(">");
            if (current_split[0] != "" && current_split[1] != "") {
                user_data[current_split[0]] = parseInt(current_split[1]);
            }
        }
    }
    updateURL(); // Update URL
    // Ajax; Class Data
    $.ajax({
        url: dataclasspath,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        beforeSend: function(xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        },
        success: function(outer_result) {
            class_data_list = outer_result; // Inject Class Data
            
            // If Passing
            if (typeof servant_pass_data !== "undefined") {
                buildServantData(servant_pass_data); // Load Data to Variable
                return;
            }
            
            // Ajax; Servant Data
            $.ajax({
                url: isMashuSR()? datapath_alternate : datapath,
                contentType: "application/json",
                dataType: "json",
                cache: false,
                beforeSend: function(xhr) {
                    if (xhr.overrideMimeType) {
                        xhr.overrideMimeType("application/json");
                    }
                },
                success: function(result) { buildServantData(result); }, // Load Data to Variable
                error: function(result) {
                    alert("Error caching Servant Class Data on AJAX!"); // Alert
                    $('#loadingModal').modal('hide'); // Close Loading Modal
                }
            });
        },
        error: function(result) {
            alert("Error caching Servant Class Data on AJAX!"); // Alert
            $('#loadingModal').modal('hide'); // Close Loading Modal
        }
    });
}

function toggleEventIcon() { $("." + servant_type_box_class).toggle(); }

//===========================================================================================
// Short URL
// Multiple providers have been coded and tested to work; code blocks have been staggered
// so that if one fails, one of the others will take over. If all the currently available
// providers fail, a message will be shown to the user explaining that URL shortening is
// out of service.
//===========================================================================================
function shareURL(site) {
    // Setting up data to send to shortener
    if (compress_input == "") {
        bootbox.alert(share_none_text);
        return;
    }

    // Gather the full URL for shortening
    var mashuSR_str = getMashuSRURLstring(true);
    var full_url = window.location.protocol + "//" + window.location.host +
        window.location.pathname + "?" + compress_input_parameter + "=" + compress_input +
        (mashuSR_str !== "" ? "&" + mashuSR_str : "");
    if (full_url.includes("localhost") || full_url.includes("127.0.0.1")) {
        full_url = full_url.replace("localhost", "fgotest.tld").replace("127.0.0.1", "fgotest.tld");
    }


    /*******************************/
    /*     Shortening services     */
    /*******************************/
    
    //----------------//
    //     waa.ai     //
    //----------------//
    function waaai() {
        return new Promise((resolve) => {
            var ajaxdata = JSON.stringify({ url: full_url });
            var ajaxrequest = {
                headers: {
                    Authorization: "API-Key 394562B4722f313b7392d97f7ea68f1cf9Df958b",
                },
                url: "https://api.waa.ai/v2/links",
                dataType: "json",
                contentType: "application/json",
                method: "POST",
                data: ajaxdata,
                success: function (result) {
                    resolve({ serviceProvider: "Akari-chan", value: result.data.link });
                }
            };
            $.ajax(ajaxrequest);
        });
    }

    //---------------//
    //     is.gd     //
    //---------------//
    function isgd() {
        return new Promise((resolve) => {
            //var ajaxdata = JSON.stringify({  });
            var ajaxrequest = {
                url: "https://is.gd/create.php",
                dataType: "json",
                data: { format: "json", url: full_url },
                success: function (result) {
                    resolve({ serviceProvider: "is.gd", value: result.shorturl });
                }
            };
            $.ajax(ajaxrequest);
        });
    }
    
    
    //----------------//
    //     owo.vc     //
    //----------------//
    function owo() {
        return new Promise((resolve) => {
            var ajaxdata = 
                JSON.stringify({ link: full_url, generator: "owo", metadata: "IGNORE" });
            var ajaxrequest = {
                contentType: 'application/json; charset=utf-8',
                url: "https://owo.vc/api/v2/link",
                method: "POST",
                dataType: "json",
                data: ajaxdata,
                success: function (result) {
                    resolve({ serviceProvider: "owo", value: result.id });
                }
            };
            $.ajax(ajaxrequest);
        });
    }    
    
    var shortProviders = [isgd(), waaai(), owo()];
    //var shortProviders = [()];      // used for testing new providers
    
    Promise.any(shortProviders)
        .then((result) => {
            if(result.value == undefined) { throw error; }
            executeShareURL(site, result.value);
        })
        .catch(() => {
            alert("URL shortening is not available at this time, as there were errors " +
                "with the URL shortening providers. Sorry for the inconvenience.");
        });
}


function executeShareURL(site, short_url) {
    // Show
    if (site == "facebook") {
        showShortURL(short_url); // Share; Show Short URL
        window.open("https://www.facebook.com/sharer.php?&u=" + short_url,"","menubar=0"); // Share to FB
    } else if (site == "twitter") {
        showShortURL(short_url); // Share; Show Short URL
        window.open("https://twitter.com/intent/tweet?url=" + short_url + "&text=" +
            share_title + "&hashtags=" + share_tags,"","menubar=0"); // Share to Xwitter
    } else { showShortURL(short_url); } 
    return false;
};

// Share; Show Short URL
function showShortURL(url) {
    var msg = share_text + '<hr/><form><div class="form-group"><div class="input-group mb-3">';
    msg += '<input type="text" id="link-copy" class="form-control" value="' + url + '" readonly/>';
    msg += '<div class="input-group-append">'
    msg += '<button class="btn btn-outline-secondary" type="button" onclick="copyToClipboard(' + "'link-copy'" +  ')">Copy</button>';
    msg += '</div></div></div></form>';
    var url_dialog = bootbox.dialog({ message: msg });
    url_dialog.init(function(){});
}

function copyToClipboard(s_element) {
    var copyText = document.querySelector("#" + s_element);
    copyText.select();
    navigator.clipboard.writeText(copyText.value || copyText.defaultValue);
}

function getRandomHash() {
    if (existing_hash != null) { return existing_hash; }
    existing_hash = Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
    existing_hash += Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
    return existing_hash;
}