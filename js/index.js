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
var share_tags = "FGO,FateGrandOrder,My_FGO_Checklist";
var share_title = "See my Servant collection here!";

// Class Config
var class_divide_class = "ByClass";
var class_div_icon_class = "col-1 class_icon_box";
var class_div_list_class = "col";
var class_img_path = "img/classes/";

var class_count_have = "class_have_";
var class_count_max = "class_max_";

// Servant Type
var servant_type_box_class = "member-type";
var servant_typelist = [
    { "id": 0, "show": false, "eventonly": false, "ctext": null,
        "class": null }, // Default
    { "id": 1, "show": true, "eventonly": false,
        "ctext": '<i class="fas fa-shield-alt"></i>',
        "class": "member-mashu" }, // Mash
    { "id": 2, "show": true, "eventonly": false,
        "ctext": '<i class="fas fa-lock"></i>',
        "class": "member-locked" }, // Storylocked
    { "id": 3, "show": true, "eventonly": false,
        "ctext": '<i class="fas fa-star"></i>',
        "class": "member-limited" }, // Limited
    { "id": 4, "show": true, "eventonly": true,
        "ctext": '<i class="fas fa-gift"></i>',
        "class": "member-eventonly" } // Welfare
];

// Confirm
var member_uncheck_conf = "Are you sure you want to uncheck this Servant?";
var member_clear_conf = "Are you sure you want to clear all checked Servants?";

// Share
var share_text = "This is your current shortened URL:";
var share_none_text = "There is nothing to share.";

// Select Text
var select_all_text = "This will not affect already selected Servants. " +
    "However, <b><i>THIS CHANGE CANNOT BE REVERTED</i></b>.<br><br>Are " +
    "you sure you want to continue?";

// Statistic
var statistic_area = "statisticBox";

// Parameters
var raw_input_parameter = "raw";
var compress_input_parameter = "pak";
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
var NAonly_local = "fgo_naonly";

var list_local = "fgo_list";

var load_text = "List data found on your current browser. Would you like to " +
    "load it?";
var save_text = "Would you like to save current list data? This will " +
    "overwrite old data if it exists.";

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
var export_filename = (function() {
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
var encoded_user_input = "";
var compress_input = "";

var current_edit = "";
var current_edit_ele = null;

var own_data = {};
var own_data_eachclass = {};

var own_data_notevent = {};
var own_data_byclass_notevent = {};

var max_data_eachclass = {};

var jump_to_target = null;

// Global Objects
var custom_adapter = null;
var list_new = null;
var list_update = null;

var threshold_error = "Unable to get the NA threshold; JP-only Servants " +
    "will not be able to be hidden.";
var NAonly_parameter = "NA";
var NAonly_checkbox = "NAonly";
var initial_load = true;

var globalThreshold = 99999;
var cookieName = "20240910_notice";

/**
 * Setting up AJAX to always override the content/MIME type with json.
 */
$.ajaxSetup({
    beforeSend: function(xhr) {
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("application/json");
        }
    }
});

/**
 * Setting up custom data adapter for on-the-fly customizable jQuery Select2
 * boxes.
 */
$.fn.select2.amd.define('select2/data/customAdapter',
    ['select2/data/array', 'select2/utils'],
    function (ArrayAdapter, Utils) {
        function CustomDataAdapter ($element, options) {
             CustomDataAdapter.__super__.constructor
                .call(this, $element, options);
        }
        Utils.Extend(CustomDataAdapter, ArrayAdapter);
        CustomDataAdapter.prototype.updateOptions = function (data) {
            this.$element.find('option').remove();
            this.addOptions(this.convertToOptions(data));
        }
        return CustomDataAdapter;
    }
);

/**
 * Uses the Atlas Academy API to get the internal game ID of the latest Servant
 * released, in the global/EN server, in order to know when to construct NA/EN
 * links to the the Atlas Academy Database Servant pages. Slightly rewritten to
 * not use `$collection.at()` anymore since certain older versions of browsers
 * don't seem to support it.
 * @returns {Promise<void>} A promise that resolves when the fetch is complete.
 */
async function fetchGlobalThreshold() {
    try {
        const NAreleases =
            (await fetch    // get *all* NA release IDs
                ("https://api.atlasacademy.io/export/NA/basic_servant.json")
                .then((r) => r.json())).map((s) => s.collectionNo);
        globalThreshold = NAreleases[NAreleases.length - 1];  // get last NA ID
    } catch (error) {
        console.error(error);
        $(".newFeature").addClass("JPdisabled");
        $("label[for='NAonly']").addClass("JPdisabled");
        $("#NAonly").prop("disabled", true);
        bootbox.alert(threshold_error, null);
    }
}

/**
 * General setup for when the page is initially loaded and the DOM is ready.
 */
$(async function() {
    await fetchGlobalThreshold();
    $('#loadingModal').modal('show'); // Show Loading Modal
    var cookie = (getCookie(cookieName) === "true");
    if(cookie) { removeNoticeboard(); }
    else { $("#noticeBoard").css("display", "block"); }
    // Load File Prepare
    $("#" + file_hidden_id).on("change", (function()
        { loadUploadedFileData(); }));
    var urlParams =
        new URLSearchParams(window.location.search); // URL Params
    custom_adapter =
        $.fn.select2.amd.require('select2/data/customAdapter'); // Prepare
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
    var NAonly_input = urlParams.get(NAonly_parameter);
    compress_input = urlParams.get(compress_input_parameter);
    // Mash is SR
    if (MashuSR_input != null) {
        var Mashu_IS_SR = (parseInt(MashuSR_input) > 0);
        $('#' + mashuSR_checkbox).prop('checked', Mashu_IS_SR);
    } else {
        // Mash is SR
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
            var classmode_enable =
                (parseInt(localStorage[class_mode_local]) > 0);
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
            var fastmode_enable =
                (parseInt(localStorage[fast_mode_local]) > 0);
            $('#' + fastmode_checkbox).prop('checked', fastmode_enable);
        }
    }
    // NA only
    if(NAonly_input != null) {
        var NAonly_enable = (parseInt(NAonly_input) > 0);
        $("#" + NAonly_checkbox).prop('checked', NAonly_enable);
    } else {
        if(localStorage[NAonly_local]) {
            var NAonly_enable = (parseInt(localStorage[NAonly_local]) > 0);
            $("#" + NAonly_checkbox).prop('checked', NAonly_enable);
        }
    }
    // Load From URL
    if (compress_input != null) {
        encoded_user_input =
            LZString.decompressFromEncodedURIComponent
            (compress_input); // List Reader
        finishLoading(); // Finish Loading
    } else {
        encoded_user_input = urlParams.get(raw_input_parameter);
        if (encoded_user_input != null) { finishLoading(); } // Finish Loading
        else {
            if (localStorage[list_local]) { loadLocalData(); } // List Reader
            else {
                encoded_user_input = ""; // Blank Raw
                finishLoading(); // Finish Loading
            }
        }
    }
    if (localStorage[list_local])
        { $('#' + load_btn).prop('disabled', false); } // Load Button Status
    // Set Checkbox Events
    $('#' + fastmode_checkbox).on("change",
        function () { updateURLOptionModeOnly(); });
    $('#' + classmode_checkbox).on("change",
        function () { updateClassMode(); });
    $('#' + mashuSR_checkbox).on("change", function () { updateClassMode(); });
    $('#' + NAonly_checkbox).on("change", function () { updateClassMode(); });
    $('#rmvNotice').on("click", function() {
        setCookie(cookieName, true);
        removeNoticeboard();
    });
    // Set Modal Closing Event
    $("#addModal").on("hidden.bs.modal", function () {
        current_edit = "";
        current_edit_ele = null;
    });
    $("#updateModal").on("hidden.bs.modal", function () {
        current_edit = "";
        current_edit_ele = null;
    });
    try { var isFileSaverSupported = !!new Blob; } // Check for FileSaver.js
    catch (e) {
        $("#loadbutton_f").prop("disabled", "disabled");
        $("#savebutton_f").prop("disabled", "disabled");
        $("#page_whatami").append("<br><b>NOTICE:</b> FileSaver.js " +
            "functionality not supported! Upload &amp; Download " +
            "buttons have been disabled.");
    }
});

/**
 * Toggles the display of the unique icon identifiers for each category of
 * units.
 */
function toggleUnitTypeIcon() { $("." + servant_type_box_class).toggle(); }

/**
 * Returns whether Fast Mode is activated.
 * @returns True if Fast Mode is on, False otherwise.
 */
function isFastMode()
{ return $('#' + fastmode_checkbox).is(':checked'); } // FastMode Check

/**
 * Returns whether Class Mode is activated.
 * @returns True if Class Mode is on, False otherwise.
 */
function isClassMode()
{ return $('#' + classmode_checkbox).is(':checked'); } // ClassMode Check

/**
 * Returns whether JP-only Servants should be hidden.
 * @returns True if the hiding checkbox is checked, False otherwise.
 */
function isNAonly()
{ return $('#' + NAonly_checkbox).is(':checked'); } // Hide JP Check

/**
 * Returns whether Mash is marked as SR.
 * @returns True if Mash is marked as SR, False otherwise.
 */
function isMashuSR()
{ return $('#' + mashuSR_checkbox).is(':checked'); } // ClassMode Check

/**
 * Removes the specified unit from local storage.
 * @param {string} id The ID of the unit to remove.
 */
function executeUserDataRemoval(id) { delete user_data[id]; }

/**
 * Returns a string indicating the state of Fast Mode for URL injection.
 * @returns An empty string if Fast Mode is off;
 * `{$fastmode_parameter}=1` if it's on.
 */
function getFastModeURLstring()
{ return isFastMode() ? fastmode_parameter + "=1" : ""; }

/**
 * Returns a string indicating the state of Class Mode for URL injection.
 * @returns An empty string if Class Mode is off,
 * `{$classmode_parameter}=1` if it's on.
 */
function getClassModeURLstring()
{ return isClassMode() ? classmode_parameter + "=1" : ""; }

/**
 * Returns a string indicating whether JP-only units should be hidden.
 * @returns An empty string if "hide JP units" is off;
 * `{$NAonly_parameter}=1` if it's on.
 */
function getNAonlyURLstring()
{ return isNAonly() ? NAonly_parameter + "=1" : ""; }

/**
 * Returns the serialized form of the currently saved unit data.
 * @returns A string representation of the currently saved unit data.
 */
function getSerializedUnitData() {
    return compress_input + (getMashuSRURLstring(false) ?
        "&" + MashuIsSR : ''); // Get compress_input
}

/**
 * Triggers the File Open dialog box.
 */
function openFileOption() { document.getElementById(file_hidden_id).click(); }

/**
 * Updates the UI whenever Class Mode is toggled.
 */
function updateClassMode()
{ updateURLOptionModeOnly(); finishLoading(); } // Class Mode Change

/**
 * Jumps to a specific point in the viewport.
 * @returns Void.
 */
function jumpTo(){
    if (jump_to_target === null) { return; }
    document.getElementById
        (jump_to_target).scrollIntoView(); // Even IE6 supports this
    jump_to_target = null;
}

/**
 * Takes a key-value pair and sorts the keys alphabetically, then returns the
 * sorted collection.
 * @param {object} not_sorted Unsorted collection of key-value pairs.
 * @returns A new collection of key-value pairs sorted alphabetically by the
 * keys.
 */
function orderKeys(not_sorted) {
  var sorted = Object.keys(not_sorted)
    .sort().reduce(function (acc, key) {
        acc[key] = not_sorted[key];
        return acc;
    }, {});
    return sorted;
}

/**
 * Preloads images asynchronously.
 * @param {string} src The address/URL of the image to load.
 * @returns A promise that resolves when the image finishes loading.
 */
function loadSprite(src) {
    var deferred = $.Deferred();
    var sprite = new Image();
    sprite.onload = function() { deferred.resolve(); };
    sprite.src = src;
    return deferred.promise();
}

/**
 * Builds a new Select2 box for the desired unit for the detailed popup.
 * @param {number} current_max The currently selected element.
 * @param {object} s_list The list of elements to display in the box.
 */
function getNewCopySource(current_max, s_list) {
    if (current_max < copy_choice_max && current_max > 0) {
        var new_choice_allow = []; var i = 0;
        for (i = 0; i < copy_choice_allow.length; i++) {
            if (copy_choice_allow[i].id <= current_max) {
                new_choice_allow.push(copy_choice_allow[i]);
            } else { break; }
        }
        s_list.data('select2').dataAdapter.updateOptions(new_choice_allow);
    } else
    { s_list.data('select2').dataAdapter.updateOptions(copy_choice_allow); }
}

/**
 * Gets the path to an image in the current codebase project. Used for loading
 * an unknown image if the unit json definition data file doesn't include one.
 * @param {string} path The path to the image local to the codebase.
 * @param {boolean} external_source Whether the image is from an external
 * source.
 * @returns The full path to the desired image.
 */
function getImagePath(path, external_source) {
    if (external_source) { return path; } else {
        return location.href.substring
            (0, location.href.lastIndexOf("/") + 1) + img_path + path;
    }
}

/**
 * Gets the path to the class images.
 * @param {string} path The class to get the image for.
 * @returns The full path to the desired class image.
 */
function getImageClassPath(path) {
    return location.href.substring
        (0, location.href.lastIndexOf("/") + 1) + class_img_path + path;
}

/**
 * Fetches data stored about the currently selected unit. If none, returns
 * undefined.
 * @param {string} id The ID of the currently selected unit.
 * @returns Undefined if there's no stored data; the saved data of the
 * selected unit if there is.
 */
function getStoredUnitData(id) {
    if (typeof user_data[id] === "undefined") { return null; }
    return user_data[id];
}

/**
 * Serializes the current data into an easily compressable string.
 * @param {object} input_data The data to be serialized.
 * @returns A string representation of the current data.
 */
function serializeCurrentDataForURLOutput(input_data) {
    var serialized_input = "", key;
    for (key in input_data) {
        if (input_data.hasOwnProperty(key)) {
            var current_user_data = input_data[key];
            serialized_input += key + ">" + current_user_data + ",";
        }
    }
    serialized_input = serialized_input.slice(0, -1); // Remove last comma
    return serialized_input;
}

/**
 * Validates if the current URL contains the old parameter name "mashu" and
 * converts/updates it to the current parameter name "mash" when Mash is marked
 * as SR.
 * @returns Forces returning "mash".
 */
function getMashParameter() {
    var urlParams = new URLSearchParams(window.location.search);
    var mashValue = urlParams.get("mash") || urlParams.get("mashu");
    if (mashValue !== null) {
        // Update the parameter to the new standard 'mash' if it's 'mashu'
        if (urlParams.has("mashu")) {
            urlParams.delete("mashu");
            urlParams.set("mash", mashValue);
            // Update the URL without reloading the page
            window.history.replaceState({}, '',
                `${window.location.pathname}?${urlParams}`);
        }
    }
    return mashValue;
}

/**
 * Left click on a given unit's portrait.
 * @param {string} s_element The ID of the unit clicked on.
 */
function elementLeftClick(s_element) {
    var id = $(s_element).attr("id");
    var name = $(s_element).data("original-title");
    // Fast Mode, Change Value Directly
    if (isFastMode()) {
        updateUnitDataInFastMode(id, 1, s_element); // Change Value
        return; // Stop
    }
    // Mark current_edit
    current_edit = id;
    current_edit_ele = s_element;
    var current_user_data = getStoredUnitData(id);
    var current_edit_max = servants_data_list[id].maxcopy;
    // New Check or Update
    if (current_user_data != null) {
        getNewCopySource(current_edit_max, list_update); // Select 2
        $('#nameUpdate').html(name); // Update Modal String
        $('#npUpdate').val(current_user_data)
            .trigger('change'); // Reset Modal Choice to Current
        $('#updateModal').modal('show'); // Show Update Check Modal
    } else {
        getNewCopySource(current_edit_max, list_new); // Select 2
        $('#nameAdd').html(name); // Update Modal String
        $('#npAdd').val(copy_choice_default)
            .trigger('change'); // Reset Modal Choice to Default
        $('#addModal').modal('show'); // Show New Check Modal
    }
}

/**
 * Right click on a given unit's portrait.
 * @param {string} s_element The ID of the unit clicked on.
 */
function elementRightClick(s_element) {
    if (!isFastMode()) { return; } // Fast Mode, Change Value Directly
    var id = $(s_element).attr("id");
    var name = $(s_element).data("original-title");
    updateUnitDataInFastMode(id, -1, s_element); // Mark current_edit
}

/**
 * Confirms the removal of the currently selected unit.
 */
function removeUserData() {
    if (current_edit == "" || current_edit_ele == null)
        { return; } // Prevent Blank Key
    bootbox.confirm({ // Confirm
        message: member_uncheck_conf,
        buttons: {
            cancel: { label: '<i class="fa fa-times"></i> Cancel' },
            confirm: { label: '<i class="fa fa-check"></i> Confirm' }
        },
        callback: function (result) {
            if (result) {
                var current_user_data =
                    getStoredUnitData(current_edit); // Get User Data
                if (current_user_data != null)
                    { executeUserDataRemoval(current_edit); } // Delete Data
                updateCounts(current_edit, -1, true); // Update Count
                $('#' + current_edit)
                    .removeClass(member_class_checked); // Update element
                updateAmountOfCopiesOwned
                    (current_edit, 0, current_edit_ele); // Update list value
                $('#updateModal').modal('hide'); // Hide Update Check Modal
                updateStatisticsHTML();
                updateURL();
                current_edit = ""; // clear current_edit
            }
        }
    });
}

/**
 * Updates list data locally.
 * @param {string} id The ID of the unit to update.
 * @param {number} val The new amount of copies owned.
 * @param {boolean} showloading Whether to show a loading screen or not.
 */
function updateCounts(id, val, showloading) {
    const servant = servants_data_list[id];
    const { eventonly, class: servantClass, key } = servant;
    // Initialize data structures if not present
    if (!(key in own_data)) {
        own_data[key] = [];
        own_data_eachclass[key] = {};
        own_data_notevent[key] = [];
        own_data_byclass_notevent[key] = {};
    }
    if (!(servantClass in own_data_eachclass[key])) {
        own_data_eachclass[key][servantClass] = [];
        own_data_byclass_notevent[key][servantClass] = [];
    }
    const updateList = (list, id, add) => {
        if (add) { list.push(id); }
        else { list = list.filter((item) => item !== id); }
        return list;
    };
    // Update count
    const add = val !== -1;
    own_data[key] = updateList(own_data[key], id, add);
    own_data_eachclass[key][servantClass] =
        updateList(own_data_eachclass[key][servantClass], id, add);
    if (!eventonly) {
        own_data_notevent[key] =
            updateList(own_data_notevent[key], id, add);
        own_data_byclass_notevent[key][servantClass] =
            updateList(own_data_byclass_notevent[key][servantClass], id, add);
    }
}

/**
 * Handles quick update of unitss when Fast Mode is activated.
 * @param {string} id The ID of the selected unit.
 * @param {number} val The direction in which to increase the current value
 * (up or down).
 * @param {string} s_element The HTML element of the Selected unit.
 */
function updateUnitDataInFastMode(id, val, s_element) {
    // Mark current_edit
    var current_user_data = getStoredUnitData(id);
    var current_edit_max = servants_data_list[id].maxcopy;
    if (current_edit_max > copy_choice_max)
        { current_edit_max = copy_choice_max; } // Prevent Over Data
    // New Check or Update
    if (current_user_data != null) {
        var new_val = current_user_data + val; // Get New Value
        if (new_val <= 0 || new_val > current_edit_max) {
            // Remove Instead
            $(s_element).removeClass(member_class_checked);
            updateAmountOfCopiesOwned(id, 0, s_element);
            updateCounts(id, -1, true); // Update Count
            executeUserDataRemoval(id); // Clear Number
        } else {
            user_data[id] = new_val; // Update user data
            updateAmountOfCopiesOwned(id, new_val, s_element);
        }
    } else {
        if (val <= 0) {
            user_data[id] = current_edit_max; // Add user data
            $(s_element).addClass(member_class_checked);
            updateAmountOfCopiesOwned(id, user_data[id], s_element);
            updateCounts(id, 1, true); // Update Count
        } else {
            user_data[id] = 1; // Add user data
            updateCounts(id, 1, true); // Update Count
            $(s_element).addClass(member_class_checked);
        }
    }
    updateStatisticsHTML();
    updateURL();
}

/**
 * Updates the selected unit's ownership status/level.
 */
function updateUnitData() {
    if (current_edit == "" || current_edit_ele == null)
        { return; } // Prevent Blank Key
    var current_user_data = getStoredUnitData(current_edit); // Get User Data
    // New Check or Update
    if (current_user_data != null) {
        var new_val = parseInt($('#npUpdate').val()); // Get New Value
        user_data[current_edit] = new_val; // Update user data
        updateAmountOfCopiesOwned
            (current_edit, new_val, current_edit_ele);
        $('#updateModal').modal('hide'); // Hide Update Check Modal
    } else {
        var new_val = parseInt($('#npAdd').val()); // Get New Value
        user_data[current_edit] = new_val; // Add user data
        updateCounts(current_edit, 1, true); // Update Count
        $('#' + current_edit)
            .addClass(member_class_checked);
        updateAmountOfCopiesOwned
            (current_edit, new_val, current_edit_ele);
        $('#addModal').modal('hide'); // Hide New Check Modal
    }
    updateStatisticsHTML(); updateURL();
    current_edit = ""; // Clear current edit
}

/**
 * Updates the amount of copies owned by the specified value.
 * @param {string} id The ID of the unit to update.
 * @param {number} new_val The new amount of copies owned.
 * @param {string} s_element The target DOM element.
 */
function updateAmountOfCopiesOwned(id, new_val, s_element) {
    if (!id) { return; }
    const content = new_val > 1 ? morecopy_text + new_val : "";
    $(s_element).find(`#${morecopy_prefix}${id}`).html(content);
}

/**
 * Returns an URL component that determines if Mash should be treated as of SR
 * rarity.
 * @param {boolean} allowZero If false, returns "mash=1" if Mash is SR, and an
 * empty string if she's not; true returns "mash=0" for URL shortening if she's
 * not marked as SR.
 * @returns Empty string for general use if Mash isn't marked as SR, or
 * "mash=0" for URL shortening; "mash=1" if she's marked as SR.
 */
function getMashuSRURLstring(allowZero) {
    return isMashuSR() ?
        `${mashuSR_parameter}=1` :
        (allowZero ? `${mashuSR_parameter}=0` : "");
}

/**
 * Updates the URL each time a unit's data is changed to reflect the new
 * collection status.
 * @returns True when the URL is successfully updated.
 */
function updateURL() {
    // Sort keys and update raw input
    user_data = orderKeys(user_data);
    encoded_user_input = serializeCurrentDataForURLOutput(user_data);
    var new_parameter = ""; // Initialize new parameter
    // Compress user data and update buttons
    if (encoded_user_input) {
        compress_input =
            LZString.compressToEncodedURIComponent(encoded_user_input);
        new_parameter = `?${compress_input_parameter}=${compress_input}`;
        $('#' + save_btn).prop('disabled', false);
        $('#' + save_file_btn).prop('disabled', false);
    } else {
        compress_input = null;
        $('#' + save_btn).prop('disabled', true);
        $('#' + save_file_btn).prop('disabled', true);
    }
    // Add additional parameters
    [getMashuSRURLstring(false), getClassModeURLstring(),
        getFastModeURLstring(), getNAonlyURLstring()].forEach((param) => {
        if (param)
        { new_parameter += (new_parameter.includes("?") ? "&" : "?") + param; }
    });
    // Update URL
    const newurl = `${window.location.protocol}//${window.location.host}` +
        `${window.location.pathname}${new_parameter}`;
    window.history.pushState({ path: newurl }, '', newurl);
    return true;
}

/**
 * Updates the URL to include the various URL options (Mash being SR,
 * Class/Fast Modes being toggled).
 */
function updateURLOptionModeOnly() {
    const urlParams = new URLSearchParams(window.location.search);
    const options = [
        { key: mashuSR_parameter, value:
            getMashuSRURLstring(false), storageKey: mashuSR_local },
        { key: classmode_parameter, value:
            getClassModeURLstring(), storageKey: class_mode_local },
        { key: fastmode_parameter, value:
            getFastModeURLstring(), storageKey: fast_mode_local },
        { key: NAonly_parameter, value:
            getNAonlyURLstring(), storageKey: NAonly_local }
    ];
    options.forEach(({ key, value, storageKey }) => {
        if (value) {
            urlParams.set(key, value.slice(-1));  // Remove '=' from value
            localStorage[storageKey] = 1;
        } else {
            urlParams.delete(key);
            localStorage[storageKey] = 0;
        }
    });
    const newUrl = `${window.location.protocol}//${window.location.host}` +
        `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
}

/**
 * Builds the completed UI with amount of copies for all characters.
 * @param {object} units_data The currently saved list data.
 */
function buildUnitDataInUI(units_data) {
    $('[data-toggle="tooltip-member"]').tooltip('dispose'); // Clear tooltip
    $( ".listbox" ).html(""); // Clear contents
    $( ".listbox_class" ).html(""); // Clear contents
    // Reset Values
    rarity_count_data.allcount.max = 0;
    rarity_count_data.noteventcount.max = 0;
    own_data = {};
    own_data_eachclass = {};
    own_data_notevent = {};
    own_data_byclass_notevent = {};
    // Draw Button & Create User Data
    var list_box = [], list_img = [];
    // Add Default Photo
    var img_default = getImagePath(icondefault, icondefault_external_source);
    list_img.push(loadSprite(img_default));
    // Loop
    var aa = 0;
    for (aa = 0; aa < units_data.length; aa++) {
        // list get
        var current_rarity = units_data[aa];
        var current_key = current_rarity.list_id;
        // Skip if Disable
        if (current_rarity.disable) { continue; }
        // Count Data Prepare
        var tem_list = current_rarity.list.filter(function(item) {
            var current_servant_type = servant_typelist[item.stype];
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
        var curr_element = "#" + current_rarity.list_element;
        var current_path = current_rarity.list_iconpath;
        list_box.push(curr_element);
        if (isClassMode()) { // Class Mode; Prepare Element
            var list_class_available = current_rarity.class_available;
            var current_class_html = "";
            for (var bb = 0; bb < list_class_available.length; bb++) {
                var current_class = list_class_available[bb]; // Class Var
                if (typeof max_data_eachclass[current_key] === "undefined")
                    { max_data_eachclass[current_key] = {}; } // Make Max Data
                max_data_eachclass[current_key][current_class] = 0;
                // Prepare Div
                current_class_html += '<div class="row classBox" id="' +
                    current_key + "_" + current_class + '">';
                current_class_html += '<div class="' + class_div_icon_class +
                    '" style="text-align: center">';
                // Class Icon
                var current_class_data = class_data_list[current_class];
                var current_class_data_icn = getImageClassPath
                    (current_class_data.iconlist[current_rarity.list_id]);
                list_img.push(loadSprite(current_class_data_icn));
                var current_class_data_icn_ele = '<img src="' +
                    current_class_data_icn + '" class="' + img_class +
                    '" title="' + current_class_data.name +
                    '" data-toggle="tooltip-member" data-placement="bottom"/>';
                current_class_html += current_class_data_icn_ele;
                // Class  Basic Count
                current_class_html += "<div>";
                current_class_html += '<span id="' + class_count_have +
                    current_key + "_" + current_class + '">0</span>/'
                current_class_html += '<span id="' + class_count_max +
                    current_key + "_" + current_class + '">0</span>'
                current_class_html += "</div>";
                // All + None Button
                current_class_html += '<button type="button" class="btn ' +
                    'btn-outline-primary btn-xs" ' +
                    'onclick="promptMarkAllUnitsSelected(false, ' + "'" +
                    current_key + "', '" + current_class + "'" +
                    ')">All</button>';
                current_class_html += '<button type="button" class="btn ' +
                    'btn-outline-danger btn-xs" ' +
                    'onclick="promptMarkAllUnitsSelected(true, ' +  "'" +
                    current_key + "', '"+ current_class + "'" +
                    ')">None</button>'
                current_class_html += "</div>";
                current_class_html += '<div class="row ' + class_div_list_class
                    + ' classRow" id="' + current_rarity.list_element + '_' +
                    current_class + '">';
                current_class_html += "</div></div><hr />";
            }
            $(curr_element + "-" + class_divide_class)
                .html(current_class_html); // Update List Div
        }
        // Loop List
        for (var i = 0, l = current_list.length; i < l; i++) {
            // Get Data
            var current_servant = current_list[i];
            if(isNAonly() && current_servant.game_id > globalThreshold )
                { continue; }
            var current_type = servant_typelist[current_servant.stype];
            servants_data_list[current_servant.id] = current_list[i];
            servants_data_list[current_servant.id].key = current_key;
            servants_data_list[current_servant.id].class =
                current_servant.class;
            servants_data_list[current_servant.id].eventonly =
                current_type.eventonly;
            // Prepare
            var current_user_data =
                getStoredUnitData(current_servant.id);
            var current_servant_html = '<div class="' +
                member_class_grid + '"><div';
            var current_servant_class = ' class="' +
                member_class;
            var current_servant_img = '';
            if (isClassMode()) {
                max_data_eachclass[current_key]
                    [current_servant.class] += 1; // Count Data: All
            }
            if (current_user_data != null) // Update Real Count Data
                { updateCounts(current_servant.id, 1, false); }
            // Create Servant Element
            current_servant_html += ' id="' + current_servant.id + '" title="'
                + current_servant.name + '"';
            current_servant_html += ' data-toggle="tooltip-member" ' +
                'data-placement="bottom"';
            // Class
            if (current_user_data != null)
                { current_servant_class += ' ' + member_class_checked; }
            current_servant_html += current_servant_class + '"';
            current_servant_html += '>'; // Close div open tags
            // Image
            if (current_servant.img == false) {
                current_servant_img = img_default;
            } else if (current_servant.imgpath == null) {
                current_servant_img = getImagePath(current_path + '/' +
                    current_servant.id + icontype, false);
                list_img.push(loadSprite(current_servant_img));
            } else {
                current_servant_img = getImagePath
                    (current_servant.imgpath, true);
                list_img.push(loadSprite(current_servant_img));
            }
            current_servant_html += '<img src="' + current_servant_img +
                '" class="' + img_class + '"/>';
            // Multiple Copy + Event Only Tag
            current_servant_html += '<div id="' + morecopy_prefix +
                current_servant.id + '" class="' + morecopy_class + '">';
            if (current_user_data != null) {
                if (current_user_data > 1) {
                    current_servant_html += morecopy_text +
                        current_user_data.toString();
                }
            }
            current_servant_html += '</div>';
            if (current_type.show) {
                current_servant_html += '<div class="' +
                    servant_type_box_class + ' ' + current_type.class + '">'
                current_servant_html += current_type.ctext + '</div>';
            }
            current_servant_html += '</div></div>'; // Close Element
            // Add to main list
            var item = $(current_servant_html);
            if (!isClassMode()) {
                $(curr_element).append(item);
                // Unbind then rebind Element
                $(curr_element).off("click", "#" + current_servant.id);
                $(curr_element).off("contextmenu", "#" + current_servant.id);
                $(curr_element)
                    .on("click", "#" + current_servant.id , function() {
                        elementLeftClick(this);
                });
                $(curr_element)
                    .on("contextmenu", "#" + current_servant.id , function() {
                        elementRightClick(this);
                        return false;
                });
            } else {
                // Bind Element
                $(curr_element + '_' + current_servant["class"]).append(item);
                $(curr_element + '_' + current_servant.class)
                    .off("click", "#" + current_servant.id);
                $(curr_element + '_' + current_servant.class)
                    .off("contextmenu", "#" + current_servant.id);
                $(curr_element + '_' + current_servant.class)
                    .on("click", "#" + current_servant.id, function()
                        { elementLeftClick(this); });
                $(curr_element + '_' + current_servant.class)
                    .on("contextmenu", "#" + current_servant.id,
                        function() { elementRightClick(this); return false; });
            }
        }
    }
    // Removes any empty classes; hides classes unreleased in NA
    $(".classRow").each(function() {
        if($(this).children().length == 0) {
            $(this).next().remove();
            $(this).parent().remove();
        }
    });
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

/**
 * Updates the statistics section of the displayed page based on displayed
 * selected data. Calculations now work based on rendered page elements instead
 * of locally saved data in order to be able to recalculate whenever units
 * unreleased in NA are hidden.
 */
function updateStatisticsHTML() {
    const classMap = new Map([
        ["ssrBox", "5★"], ["srBox", "4★"], ["rareBox", "3★"],
        ["uncommonBox", "2★"], ["commonBox", "1★"], ["noneBox", "0✩"]
    ]);
    var overallTotal = 0, overallOwned = 0,
        overallNotEventTotal = 0, overallNotEventOwned = 0;
    var elementToSearch = isClassMode() ? ".listbox_class" : ".row.listbox";
    $(elementToSearch).each(function() {
        var $container = $(this);
        var boxType = $container.attr('id').replace("-ByClass", "");
        var $members = $container.find(`.${member_class}`);
        var totalUnits = $members.length;
        var ownedUnits = $members.filter(`.${member_class_checked}`).length;
        var $notEventUnits = $members.filter(function() {
            return !$(this).find('.member-eventonly').length;
        });
        var totalNotEventUnits = $notEventUnits.length;
        var ownedNotEventUnits =
            $notEventUnits.filter(`.${member_class_checked}`).length;
        overallTotal += totalUnits;
        overallOwned += ownedUnits;
        overallNotEventTotal += totalNotEventUnits;
        overallNotEventOwned += ownedNotEventUnits;
        var percentageOwned = (ownedUnits / totalUnits * 100).toFixed(2);
        var percentageNotEventOwned =
            (ownedNotEventUnits / totalNotEventUnits * 100).toFixed(2);
        $("#" + boxType + "AllStats")
            .text(`${classMap.get(boxType)}: ${percentageOwned}% ` +
            `(${ownedUnits}/${totalUnits})`);
        $("#" + boxType + "NotEventStats").text(`${classMap.get(boxType)}: ` +
            `${percentageNotEventOwned}% ` +
            `(${ownedNotEventUnits}/${totalNotEventUnits})`);
        if (isClassMode()) { // Update class-specific stats if in class mode
            $(".classBox .classRow").each(function() {
                var classTotal = $(this).find($(`.${member_class}`)).length;
                var classOwned = $(this)
                    .find($(`.${member_class_checked}`)).length;
                var partialCounterDivID =
                    $(this).parent().prop("id").replace("Box", "");
                $("#class_have_" + partialCounterDivID).text(classOwned);
                $("#class_max_" + partialCounterDivID).text(classTotal);
            });
        }
    });
    var overallPercent = ((overallOwned / overallTotal) * 100).toFixed(2);
    var overallNotEventPercent =
        ((overallNotEventOwned / overallNotEventTotal) * 100).toFixed(2);
    $("#statisticBoxAllPercent").text(overallPercent);
    $("#statisticBoxAllHave").text(overallOwned);
    $("#statisticBoxAllMax").text(overallTotal);
    $("#statisticBoxNotEventPercent").text(overallNotEventPercent);
    $("#statisticBoxNotEventHave").text(overallNotEventOwned);
    $("#statisticBoxNotEventMax").text(overallNotEventTotal);
}

/**
 * Clears all selected data.
 */
function clearAllData() {
    bootbox.confirm({ // Confirm
        message: member_clear_conf,
        buttons: {
            cancel: { label: '<i class="fa fa-times"></i> Cancel' },
            confirm: { label: '<i class="fa fa-check"></i> Confirm' }
        },
        callback: function (result) {
            if (result) {
                user_data = {}; // Clear User Data
                compress_input = ""; // Clear Raw Input
                encoded_user_input = ""; // Clear Raw Input
                finishLoading();
            }
        }
    });
}

/**
 * Exports the current data to a downloadable image.
 */
function exportCanvasToImage() {
    bootbox.confirm({ // Confirm
        message: "WARNING: Image result will not look exactly like in the"
        + "page. (Capture library issues.)<br/>It is recommendeded to share " +
        " the link or use an external capture tool instead.<br/>Continue?",
        buttons: {
            cancel: { label: '<i class="fa fa-times"></i> Cancel' },
            confirm: { label: '<i class="fa fa-check"></i> Confirm' }
        },
        callback: function (result) {
            if (result) {
                $('#loadingModal').modal('show'); // Show Loading Modal
                    html2canvas($('#' + capture_area)[0], { useCORS: true })
                        .then(function(canvas) {
                        // canvas is the final rendered <canvas> element
                        var alink = document.createElement('a');
                        // toDataURL defaults to png, so we need to request a
                        // jpeg, then convert for file download.
                        alink.href = canvas.toDataURL("image/jpeg")
                            .replace("image/jpeg", "image/octet-stream");
                        alink.download = export_filename.replace('_', '-')
                            .replace("fgol", "jpg");
                        //Firefox requires the link to be in the body
                        document.body.appendChild(alink);
                        alink.click();
                        document.body.removeChild(alink); // remove when done
                        $('#loadingModal').modal('hide'); // close modal
                    });
            }
        }
    });
}

/**
 * If data exists in the browser localstorage, confirms with the user whether
 * it should be loaded.
 */
function loadLocalData() {
    bootbox.confirm({ // Confirm
        message: load_text,
        buttons: {
            cancel: { label: '<i class="fa fa-times"></i> Cancel' },
            confirm: { label: '<i class="fa fa-check"></i> Confirm' }
        },
        callback: function (result) {
            if (result) {
                $('#loadingModal').modal('show'); // Show Loading Modal
                loadLocallySavedData(localStorage[list_local]); // Load List
            } else {
                if (encoded_user_input == null) {
                    encoded_user_input = ""; // Blank out raw input
                    finishLoading();
                }
            }
        }
    });
}

/**
 * Saves the currently selected data to localStorage.
 */
function saveLocalData() {
    updateURL(); // Update URL First
    if (compress_input == null) { return; } // Confirm compress_input not null
    bootbox.confirm({ // Confirm
        message: save_text,
        buttons: {
            cancel: { label: '<i class="fa fa-times"></i> Cancel' },
            confirm: { label: '<i class="fa fa-check"></i> Confirm' }
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

/**
 * Reads the uploaded file data and overwrites the currently displayed data.
 */
function loadUploadedFileData() {
    var input = document.getElementById(file_hidden_id);
     if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var getFile = reader.result;
            var n_txt = getFile
                .startsWith(export_header + export_header_separator);
            if (n_txt) {
                var res = getFile.replace
                    (export_header + export_header_separator, "");
                return loadLocallySavedData(res);
            } else { return bootbox.alert(load_fail_text, null); } // Alert
        }
        reader.readAsText(input.files[0]);
    }
}

/**
 * Loads the data stored in localstorage and expands its contents to display in
 * the UI.
 * @param {string} getresult The locally saved data.
 */
function loadLocallySavedData(getresult) {
        // Clear User Data
        user_data = {};
        compress_input = "";
        encoded_user_input = "";
        // Get Value
        compress_input = getresult;
        if (compress_input == null || compress_input == undefined) {
            compress_input = null
            bootbox.alert(load_fail_text, null);
            return;
        }
        // Get Raw
        encoded_user_input =
            LZString.decompressFromEncodedURIComponent(compress_input);
        // Error; Stop
        if (encoded_user_input == null || encoded_user_input == undefined) {
            encoded_user_input = null;
            bootbox.alert(load_fail_text, null);
            return;
        }
        finishLoading(); // Update HTML
        bootbox.alert(load_fin_text, null); // Alert
}


/**
 * Prompts the user to save the current data, and to overwrite existing data if
 * needed.
 */
function promptSaveDataExport() {
    updateURL(); // Update URL First
    if (compress_input == null) { return; } // Confirm compress_input not null
    bootbox.confirm({ // Confirm
        message: save_text,
        buttons: {
            cancel: { label: '<i class="fa fa-times"></i> Cancel' },
            confirm: { label: '<i class="fa fa-check"></i> Confirm' }
        },
        callback: function(result) { if (result)
            { exportCurrentDataToFile(compress_input); } }
    });
}

/**
 * Exports the current data to a downloadable file.
 */
function exportCurrentDataToFile() {
    var blob = new
        Blob([export_header + export_header_separator + compress_input],
        { type: "text/plain;charset=utf-8" });
    saveAs(blob, export_filename);
}

/**
 * Prompts the user to operate on all units. If deleting, deletes all units of
 * a given group. If adding, marks all units of a given group at first level of
 * copies.
 * @param {boolean} markAsDeleted Determines whether the operation needs to
 * delete or add all units.
 * @param {string} input_rarity The desired rarity in which to operate on all
 * units.
 * @param {string} input_class The desired class in the desired rarity in which
 * to operate on all units.
 */
function promptOperationOnAllUnits(markAsDeleted, input_rarity, input_class) {
    bootbox.confirm({ // Confirm
        message: select_all_text,
        buttons: {
            cancel: { label: '<i class="fa fa-times"></i> Cancel' },
            confirm: { label: '<i class="fa fa-check"></i> Confirm' }
        },
        callback: function(result) { if (result) { executeOperationOnAllUnits
            (markAsDeleted, input_rarity, input_class); } }
    });
}

/**
 * Operates on all units of a given group/subgroup. If markAsDeleted is true,
 * deletes all the units from the specified group. If it's false, marks all
 * units as owned at first level of copies.
 * @param {boolean} markAsDeleted Determines whether the operation needs to
 * delete or add all units.
 * @param {string} input_rarity The desired rarity in which to operate on all
 * units.
 * @param {string} input_class The desired class in the desired rarity in which
 * to operate on all units.
 */
function executeOperationOnAllUnits(markAsDeleted, input_rarity, input_class) {
    $('#loadingModal').modal('show'); // Open Loading Modal
    // Ajax; Unit Data
    $.ajax({
        url: isMashuSR() ? datapath_alternate : datapath,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        beforeSend: function(xhr) { if (xhr.overrideMimeType)
            { xhr.overrideMimeType("application/json"); } },
        success: function(result) {
            var servants_data = result;
            if (typeof input_rarity !== "undefined" &&
                typeof input_class !== "undefined") {
                    jump_to_target =
                        input_rarity + "_" + input_class; // Create Jump Target
                    var tem_list = servants_data.filter(function(item)
                        { return item.list_id == input_rarity; }); // Make List
                    var current_list = tem_list[0].list;
                    for (var i = 0, l = current_list.length; i < l; i++) {
                        var curr_servant = current_list[i];
                        if (curr_servant.class == input_class) {
                            if (markAsDeleted) {
                                if (typeof user_data[curr_servant.id] !==
                                    "undefined")
                                    { executeUserDataRemoval(curr_servant.id); }
                            } else {
                                if (typeof user_data[curr_servant.id] ===
                                    "undefined")
                                    { user_data[curr_servant.id] = 1; }
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
                        var curr_servant = current_list[i];
                        if (markAsDeleted) {
                            if (typeof user_data[curr_servant.id] !==
                                "undefined")
                                { executeUserDataRemoval(curr_servant.id); }
                        } else {
                            if (typeof user_data[curr_servant.id] ===
                                "undefined")
                                 { user_data[curr_servant.id] = 1; }
                        }
                    }
                }
            }
            encoded_user_input = null; // Clear Raw Input
            finishLoading(result); // Send to Finish
        },
        error: function(result) {
            alert("Error attempting to select all data!"); // Alert
            $('#loadingModal').modal('hide'); // Close Loading Modal
        }
    });
}

/**
 * Finishes the UI setup process once all data has been handled.
 * @param {object} servant_pass_data The data to display.
 */
function finishLoading(servant_pass_data) {
    // Clear Contents
    $( ".listbox" ).hide();
    $( ".listbox_class" ).hide();
    $( ".listbox_fake" ).show();
    // Convert User Data from Input
    if (encoded_user_input !== null) {
        var array_input = encoded_user_input.split(",");
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
        beforeSend: function(xhr) { if (xhr.overrideMimeType)
            { xhr.overrideMimeType("application/json"); } },
        success: function(outer_result) {
            class_data_list = outer_result; // Inject Class Data
            // If Passing
            if (typeof servant_pass_data !== "undefined") {
                buildUnitDataInUI(servant_pass_data); // Load Data to Variable
                return;
            }
            // Ajax; Unit Data
            $.ajax({
                url: isMashuSR() ? datapath_alternate : datapath,
                contentType: "application/json",
                dataType: "json",
                cache: false,
                beforeSend: function(xhr) { if (xhr.overrideMimeType)
                    { xhr.overrideMimeType("application/json"); }
                },
                success: function(result) { buildUnitDataInUI(result); },
                error: function(result) {
                    alert("Error caching Unit Class Data on AJAX!"); // Alert
                    $('#loadingModal').modal('hide'); // Close Loading Modal
                }
            });
        },
        error: function(result) {
            alert("Error caching Unit Class Data on AJAX!"); // Alert
            $('#loadingModal').modal('hide'); // Close Loading Modal
        }
    });
}

/**
 * Shortens the current data URL and returns the shortened URL. Multiple
 * providers are configured to be polled, and the returned URL will be from the
 * provider that responds the fastest.
 */
async function shortenURL() {
    // Warn user if no data
    if (compress_input == "") { bootbox.alert(share_none_text); }
    // Gather the full URL for shortening
    var mashuSR_str = getMashuSRURLstring(true);
    var full_url = window.location.protocol + "//" + window.location.host +
        window.location.pathname + "?" + compress_input_parameter + "=" +
        compress_input + (mashuSR_str !== "" ? "&" + mashuSR_str : "");
    if (full_url.includes("localhost") || full_url.includes("127.0.0.1")) {
        full_url = full_url.replace("localhost", "fgotest.tld")
        .replace("127.0.0.1", "fgotest.tld");
    }
    /*******************************/
    /*     Shortening services     */
    /*******************************/
    /**
     * Shortens the current data URL with waa.ai/Akari-chan shortener.
     * @returns A promise that resolves upon successfully shortening the
     * current URL.
     */
    function waaai() {
        return new Promise((resolve) => {
            var ajaxdata = JSON.stringify({ url: full_url });
            var ajaxrequest = {
                headers: {
                    Authorization:
                        "API-Key 394562B4722f313b7392d97f7ea68f1cf9Df958b",
                },
                url: "https://api.waa.ai/v2/links",
                dataType: "json",
                contentType: "application/json",
                method: "POST",
                data: ajaxdata,
                success: function (result) {
                    resolve({ serviceProvider: "Akari-chan",
                        value: result.data.link });
                }
            };
            $.ajax(ajaxrequest);
        });
    }
    /**
     * Shortens the current data URL with is.gd shortener.
     * @returns A promise that resolves upon successfully shortening the
     * current URL.
     */
    function isgd() {
        return new Promise((resolve) => {
            //var ajaxdata = JSON.stringify({  });
            var ajaxrequest = {
                url: "https://is.gd/create.php",
                dataType: "json",
                data: { format: "json", url: full_url },
                success: function (result) {
                    resolve({ serviceProvider: "is.gd",
                        value: result.shorturl });
                }
            };
            $.ajax(ajaxrequest);
        });
    }
    /**
     * Shortens the current data URL with owo.vc shortener.
     * @returns A promise that resolves upon successfully shortening the
     * current URL.
     */
    function owo() {
        return new Promise((resolve) => {
            var ajaxdata =
                JSON.stringify({ link: full_url, generator: "owo",
                    metadata: "IGNORE" });
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
    const shortProviders = [isgd(), waaai(), owo()];
    //const shortProviders = [()];      // used for testing new providers
    try {
        const result = await Promise.any(shortProviders);
        if (!result.value) { throw new
            Error("All promises returned undefined."); }
        return result.value;
    } catch (err) { console.error(err); return undefined; }
}

/**
 * Requests the shortening of the current URL and shows it to the user. Can
 * additionally open share windows for Xwitter and Facebook if desired. If the
 * URL can't be shortened, shows an error modal notifying the user.
 * @param {string} site "Facebook", "Twitter" (opens new windows for direct
 * sharing), or any other string (including an empty string) to just get the
 * shortened URL.
 */
function shareURL(site) {
    shortenURL().then((short_url) => {
        if(short_url == undefined) { showURLShorteningError(); return; }
        if (site == "facebook") {
            showShortURLModal(short_url); // Share; Show Short URL
            window.open("https://www.facebook.com/sharer.php?&u=" +
                short_url,"","menubar=0"); // Share to FB
        } else if (site == "twitter") {
            showShortURLModal(short_url); // Share; Show Short URL
            window.open("https://twitter.com/intent/tweet?url=" +
                short_url + "&text=" + share_title + "&hashtags=" +
                share_tags,"","menubar=0"); // Share to Xwitter
        } else { showShortURLModal(short_url); }
    });
};

/**
 * Creates and opens a popup with the shortened URL of the currently active
 * data.
 * @param {string} url The shortened URL.
 */
function showShortURLModal(url) {
    var msg = share_text + '<hr/><form><div class="form-group"><div ' +
        'class="input-group mb-3">';
    msg += '<input type="text" id="link-copy" class="form-control" value="' +
        url + '" readonly/>';
    msg += '<div class="input-group-append">'
    msg += '<button class="btn btn-outline-secondary" type="button" ' +
        'onclick="copyToClipboard(' + "'link-copy'" + ')">Copy</button>';
    msg += '</div></div></div></form>';
    var url_dialog = bootbox.dialog({ message: msg });
    url_dialog.init(function() { });
}

/**
 * Displays a modal to inform the user that there was an issue with the URL
 * shortening functionality, and that the current URL couldn't be shortened.
 */
function showURLShorteningError() {
    var msg = "There has been an error with the URL shortening functionality" +
        ". Your current data URL couldn'n be shortened.<br><br>More details" +
        " can be found in your browser console.";
    var error_dialog = bootbox.dialog({
        message: msg,
        buttons: {
            confirm: { label: '<i class="fa fa-check"></i> Ok' }
        }
    });
    error_dialog.init(function() { });
}

/**
 * Copies the resulting shortened URL to the clipboard.
 */
function copyToClipboard() {
    var copyText = document.querySelector("#link-copy");
    copyText.select();
    navigator.clipboard.writeText(copyText.value || copyText.defaultValue);
}

/**
 * Gets the value of a cookie with the specified name.
 * @param {string} name The name of the cookie to get.
 * @returns The value of the cookie if it exists; null if it doesn't.
 */
function getCookie(name) {
    var equals = name + "=", i = 0;
    var cookies = document.cookie.split(';');
    for (i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ')
            { cookie = cookie.substring(1, cookie.length); }
        if(cookie.indexOf(equals) == 0)
            { return cookie.substring(equals.length, cookie.length); }
    }
    return null;
}

/**
 * Sets a cookie.
 * @param {string} name The name of the cookie.
 * @param {any} value The desired value of the cookie.
 */
function setCookie(name, value) {
    var date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    var cookie = name + "=" + (value || "") + "; expires=" +
        date.toUTCString() + "; path=/";
    document.cookie = cookie;
}

/**
 * Removes the noticeboard at the top.
 */
function removeNoticeboard() {
    $('#noticeBoard').slideUp(function() {
        $(this).remove(); // Removes the element after the animation completes
    });
}