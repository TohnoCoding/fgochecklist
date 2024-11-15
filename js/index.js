/**************************************************************************
 *                 INITIALIZATION AND ANONYMOUS FUNCTIONS                 *
 **************************************************************************/
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
 * General setup for when the page is initially loaded and the DOM is ready.
 */
$(async function() {
    await fetchGlobalThreshold();
    $("#webAppVersion").text(Config.webAppVersion);
    $('#loadingModal').modal('show'); // Show Loading Modal
    var cookie = getCookie(Config.cookieName); // Changelog cookie check
    if(!cookie) { showChangelogModal(); }
    // Load File Prepare
    $("#" + Config.file_hidden_id).on("change", (function()
        { loadUploadedFileData(); }));
    var urlParams =
        new URLSearchParams(window.location.search); // URL parameters
    Config.custom_adapter =
        $.fn.select2.amd.require('select2/data/customAdapter'); // Prepare
    $('[data-toggle="tooltip"]').tooltip();
    // Select2
    Config.list_new = $("#npAdd").select2({
        theme: "bootstrap",
        dataAdapter: Config.custom_adapter,
        data: Config.copy_choice_allow
    });
    Config.list_update = $("#npUpdate").select2({
        theme: "bootstrap",
        dataAdapter: Config.custom_adapter,
        data: Config.copy_choice_allow
    });
    Config.wishlist_new = $("#wlAdd").select2({
        theme: "bootstrap",
        dataAdapter: Config.custom_adapter,
        data: Config.wishlist_choice_allow
    });
    Config.wishlist_update = $("#wlUpdate").select2({
        theme: "bootstrap",
        dataAdapter: Config.custom_adapter,
        data: Config.wishlist_choice_allow
    });
    var MashSR_input = urlParams.get(Config.mashSR_parameter);
    var fastmode_input = urlParams.get(Config.fastmode_parameter);
    var classmode_input = urlParams.get(Config.classmode_parameter);
    var NAonly_input = urlParams.get(Config.NAonly_parameter);
    Config.compress_input = urlParams.get(Config.compress_input_parameter);
    // Mash is SR
    if (MashSR_input != null) {
        var Mash_is_SR = (parseInt(MashSR_input) > 0);
        $('#' + Config.mashSR_checkbox).prop('checked', Mash_is_SR);
    } else {
        // Mash is SR
        if (localStorage[Config.mashSR_local]) {
            var Mash_is_SR =
                (parseInt(localStorage[Config.mashSR_local]) > 0);
            $('#' + Config.mashSR_checkbox).prop('checked', Mash_is_SR);
        }
    }
    // ClassMode
    if (Config.classmode_input != null) {
        var classmode_enable = (parseInt(classmode_input) > 0);
        $('#' + Config.classmode_checkbox).prop('checked', classmode_enable);
    } else {
        // ClassMode
        if (localStorage[Config.class_mode_local]) {
            var classmode_enable =
                (parseInt(localStorage[Config.class_mode_local]) > 0);
            $('#' + Config.classmode_checkbox)
                .prop('checked', classmode_enable);
        }
    }
    // FastMode
    if (Config.fastmode_input != null) {
        var fastmode_enable = (parseInt(fastmode_input) > 0);
        $('#' + Config.fastmode_checkbox).prop('checked', fastmode_enable);
    } else {
        // FastMode
        if (localStorage[Config.fast_mode_local]) {
            var fastmode_enable =
                (parseInt(localStorage[Config.fast_mode_local]) > 0);
            $('#' + Config.fastmode_checkbox)
                .prop('checked', fastmode_enable);
        }
    }
    // NA only mode
    if(Config.NAonly_input != null) {
        var NAonly_enable = (parseInt(NAonly_input) > 0);
        $("#" + Config.NAonly_checkbox).prop('checked', Config.NAonly_enable);
    } else {
        if(localStorage[Config.NAonly_local]) {
            var NAonly_enable =
                (parseInt(localStorage[Config.NAonly_local]) > 0);
            $("#" + Config.NAonly_checkbox).prop('checked', NAonly_enable);
        }
    }
    // Load From URL
    if (Config.compress_input != null) {
        Config.encoded_user_input =
            LZString.decompressFromEncodedURIComponent
            (Config.compress_input); // List Reader
        finishLoading();
    } else {
        Config.encoded_user_input =
            urlParams.get(Config.raw_input_parameter);
        if (Config.encoded_user_input != null) { finishLoading(); }
        else {
            if (localStorage[Config.list_local])
                { loadLocalData(); } // List reader
            else {
                Config.encoded_user_input = ""; // Blank raw
                finishLoading();
            }
        }
    }
    if (!localStorage[Config.list_local])      // Load button status
        { $('#' + Config.load_btn).removeAttr("href")
            .toggleClass("disabled-link"); }
    // Set Checkbox Events
    $('#' + Config.fastmode_checkbox).on("change",
        function () { updateURLOptionModeOnly(); });
    $('#' + Config.classmode_checkbox).on("change",
        function () { rebuildUI(); });
    $('#' + Config.mashSR_checkbox).on("change",
        function () { rebuildUI(); });
    $('#' + Config.NAonly_checkbox).on("change",
        function () { rebuildUI(); });
    // Set Modal Closing Event
    $("#addModal").on("hidden.bs.modal", function () {
        Config.current_edit = "";
        Config.current_edit_ele = null;
    });
    $("#updateModal").on("hidden.bs.modal", function () {
        Config.current_edit = "";
        Config.current_edit_ele = null;
    });
    try { var isFileSaverSupported = !!new Blob; } // Check for FileSaver.js
    catch (e) {
        $("#loadbutton_f").toggleClass("disabled-link").removeAttr("href");
        $("#savebutton_f").toggleClass("disabled-link").removeAttr("href");
        $("#page_whatami").append("<br><b>NOTICE:</b> FileSaver.js " +
            "functionality not supported! Upload &amp; Download " +
            "buttons have been disabled.");
    }
    $("#hamburger-button").on("click", function() {
        const isActive = $(this).toggleClass("active").hasClass("active");
        $(".hamburger-menu").toggleClass("active", isActive);
        $("#darkener").toggleClass("visible-darkener", isActive); 
        if (!isActive) { hideChangelogModal(); }
    });
    $("#darkener").on("click", function() {
        $(".hamburger-menu").removeClass("active");
        $("#hamburger-button").removeClass("hamburger-button-open");
        $("#darkener").removeClass("visible-darkener");
        hideChangelogModal();
    });
    if(localStorage[Config.list_local]) { $("#" + Config.load_btn).attr("href",
        "javascript:loadLocalData()"); }
    checkDateToInjectPadoru();
    //alert(`${window.innerWidth}x${window.innerHeight}px, ${window.devicePixelRatio} DPR`);
});