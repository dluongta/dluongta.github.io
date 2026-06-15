var VNKeys = new function () {
        
    const DAU_THOAT = "\\";

    const DAU = {
        SAC: 1,
        HUYEN: 2,
        HOI: 3,
        NGA: 4,
        NANG: 5,
        MU: 6,
        MOC: 7,
        TRANG: 8,
        NGANG: 9
    }

    const METHOD = {
        OFF: "off",
        AUTO: "auto",
        VNI: "vni",
        TELEX: "telex",
        VIQR: "viqr"
    }

    const COOKIE_NAME = "VNKeys";

    // Variables
    var _currentPosition = 0;
    var _currentValue;
    var _mode = METHOD.AUTO;
    var _mapUserInput = null;


    function setTypingMethod(strMode) {
        var result = METHOD.AUTO;
        if (strMode == null) {
            var element;
            var elements = document.getElementsByName("vnkeys_method");
            for (var i = 0; i < elements.length; i++) {
                element = elements[i];
                if (element.checked) {
                    result = element.value;
                    break;
                }
            }
        }
        _mode = result;
        setCookie(COOKIE_NAME, _mode, 365);
        updateUserMethod();
    }

    this.setMethod = function (strMode) {
        setTypingMethod(strMode);
    }

    function getVIQRMethod() {
        var map = {
            "'": DAU.SAC,
            "`": DAU.HUYEN,
            "?": DAU.HOI,
            "~": DAU.NGA,
            ".": DAU.NANG,
            "^": DAU.MU,
            "*": DAU.MOC,
            "+": DAU.MOC,
            "(": DAU.TRANG,
            "-": DAU.NGANG,
            "d": DAU.NGANG,
            "D": DAU.NGANG,
        };
        return map;
    }

    function getVNIMethod() {
        var map = {
            "1": DAU.SAC,
            "2": DAU.HUYEN,
            "3": DAU.HOI,
            "4": DAU.NGA,
            "5": DAU.NANG,
            "6": DAU.MU,
            "7": DAU.MOC,
            "8": DAU.TRANG,
            "9": DAU.NGANG,
        };
        return map;
    }

    function getTelexMethod() {
        var map = {
            "s": DAU.SAC,
            "f": DAU.HUYEN,
            "r": DAU.HOI,
            "x": DAU.NGA,
            "j": DAU.NANG,
            "a": DAU.MU,
            "e": DAU.MU,
            "o": DAU.MU,
            "w": DAU.MOC,
            //"z": DAU.TRANG,
            "d": DAU.NGANG,
        }
        return map;
    }


    function getUserMethod() {
        if (_mapUserInput == null) {
            setTypingMethod();
        }
        return _mapUserInput;
    }

    function updateUserMethod() {
        switch (_mode) {
            case METHOD.OFF:
                _mapUserInput = [];
                break;
            case METHOD.VIQR:
                _mapUserInput = getVIQRMethod();
                break;
            case METHOD.VNI:
                _mapUserInput = getVNIMethod();
                break;
            case METHOD.TELEX:
                _mapUserInput = getTelexMethod();
                break;
            default: // auto
                _mapUserInput = getAutoMethod();
            //for (var k)
        }
    }

    function getAutoMethod() {
        var map = new Array();
        concatMap(map, getVIQRMethod());
        concatMap(map, getVNIMethod());
        concatMap(map, getTelexMethod());
        return map;
    }

    function concatMap(map, target) {
        for (var key in target) {
            if (target.hasOwnProperty(key)) {
                if (!map[key]) {
                    map[key] = target[key];
                }
            }
        }
    }

    function getDauByInput(charStr) {
        return getUserMethod()[charStr];
    }

    function convertToViet(charStr) {
        if (_currentPosition > 0) {
            var ch = _currentValue.substr(_currentPosition - 1, 1);
            if (ch == DAU_THOAT) {
                return charStr;
            }
            var dau = getDauByInput(charStr);
            if (dau != null) {
                if (dau == DAU.SAC) {
                    return _mapSac[ch];
                }
                if (dau == DAU.HUYEN) {
                    return _mapHuyen[ch];
                }
                if (dau == DAU.HOI) {
                    return _mapHoi[ch];
                }
                if (dau == DAU.NGA) {
                    return _mapNga[ch];
                }
                if (dau == DAU.NANG) {
                    return _mapNang[ch];
                }
                if (dau == DAU.MU) {
                    return _mapMu[ch];
                }
                if (dau == DAU.MOC) {
                    // Check for TELEX 
                    if ((_mode == METHOD.TELEX) || (_mode == METHOD.AUTO)) {
                        //aw = ă  | dùng dấu trăng nếu là a hoặc A
                        if (ch == "a" || ch == "A") {
                            return _mapTrang[ch];
                        }
                    }
                    return _mapMoc[ch];
                }
                if (dau == DAU.TRANG) {
                    return _mapTrang[ch];
                }
                if (dau == DAU.NGANG) {
                    return _mapNgang[ch];
                }
            }
        }
        return null;
    }

    function inputEventHandler(evt) {
        var val = this.value; // Get the updated value of the input
        _currentValue = val; // Update the global _currentValue variable

        // Ensure _currentPosition is updated and not reinitialized
        var start = this.selectionStart; // Get the caret position
        _currentPosition = start; // Update the global _currentPosition variable

        // Prevent errors if the caret is at the start of the input
        if (start <= 0) return;

        // Get the last input character
        var inputChar = val.charAt(start - 1);

        // Check if the last character is Space or Enter
        if (inputChar === ' ') {
            // console.log("Space key detected");
            return; // Exit if Space is entered
        }
        if (inputChar === '\n' || inputChar === '\r') {
            // console.log("Enter key detected");
            return; // Exit if Enter is entered
        }
        start = this.selectionStart - 1;
        _currentPosition = start;
        // Transform the typed character
        var mappedChar = convertToViet(inputChar);
        if (mappedChar != null) {
            if (typeof this.selectionStart === "number" && typeof this.selectionEnd === "number") {
                var end = this.selectionEnd; // Local variable for selection end

                // Replace the last character with the transformed character
                this.value = val.slice(0, start - 1) + mappedChar + val.slice(end);

                // Move the caret to the correct position
                this.selectionStart = this.selectionEnd = start; // Keep the caret position consistent
            }
        }
    }

    // Contants
    const _mapSac = {
        // xóa dấu
        "á": "a",
        "Á": "A",
        "ắ": "ă",
        "Ắ": "Ă",
        "ấ": "â",
        "Ấ": "Â",
        "é": "e",
        "É": "E",
        "ế": "ê",
        "Ế": "Ê",
        "í": "i",
        "Í": "I",
        "ó": "o",
        "Ó": "O",
        "ố": "ô",
        "Ố": "Ô",
        "ớ": "ơ",
        "Ớ": "Ơ",
        "ú": "u",
        "Ú": "U",
        "ứ": "ư",
        "Ứ": "Ư",
        "ý": "y",
        "Ý": "Y",
        // End

        "a": "á",
        "A": "Á",
        "ă": "ắ",
        "Ă": "Ắ",
        "â": "ấ",
        "Â": "Ấ",
        "e": "é",
        "E": "É",
        "ê": "ế",
        "Ê": "Ế",
        "i": "í",
        "I": "Í",
        "o": "ó",
        "O": "Ó",
        "ô": "ố",
        "Ô": "Ố",
        "ơ": "ớ",
        "Ơ": "Ớ",
        "u": "ú",
        "U": "Ú",
        "ư": "ứ",
        "Ư": "Ứ",
        "y": "ý",
        "Y": "Ý",
        "": ""
    }
    const _mapHuyen = {
        // Xóa dấu
        "à": "a",
        "À": "A",
        "ằ": "ă",
        "Ằ": "Ă",
        "ầ": "â",
        "Ầ": "Â",
        "è": "e",
        "È": "E",
        "ề": "ê",
        "Ề": "Ê",
        "ì": "i",
        "Ì": "I",
        "ò": "o",
        "Ò": "O",
        "ồ": "ô",
        "Ồ": "Ô",
        "ờ": "ơ",
        "Ờ": "Ơ",
        "ù": "u",
        "Ù": "U",
        "ừ": "ư",
        "Ừ": "Ư",
        "ỳ": "y",
        "Ỳ": "Y",
        // End of xóa dấu
        "a": "à",
        "A": "À",
        "ă": "ằ",
        "Ă": "Ằ",
        "â": "ầ",
        "Â": "Ầ",
        "e": "è",
        "E": "È",
        "ê": "ề",
        "Ê": "Ề",
        "i": "ì",
        "I": "Ì",
        "o": "ò",
        "O": "Ò",
        "ô": "ồ",
        "Ô": "Ồ",
        "ơ": "ờ",
        "Ơ": "Ờ",
        "u": "ù",
        "U": "Ù",
        "ư": "ừ",
        "Ư": "Ừ",
        "y": "ỳ",
        "Y": "Ỳ",
        "": ""
    }

    const _mapHoi = {
        // A
        "ả": "a",
        "Ả": "A",
        "a": "ả",
        "A": "Ả",
        "ă": "ẳ",
        "Ă": "Ẳ",
        "Ẳ": "Ă",
        "ẳ": "ă",
        "â": "ẩ",
        "Â": "Ẩ",
        "Ẩ": "Â",
        "ẩ": "â",

        // E
        "ẻ": "e",
        "Ẻ": "E",
        "Ể": "Ê",
        "ể": "ê",
        "e": "ẻ",
        "E": "Ẻ",
        "ê": "ể",
        "Ê": "Ể",

        // I
        "Ỉ": "I",
        "ỉ": "i",
        "i": "ỉ",
        "I": "Ỉ",

        // O
        "ỏ": "o",
        "Ỏ": "O",
        "Ổ": "Ô",
        "ổ": "ô",
        "ở": "ơ",
        "Ở": "Ơ",
        "o": "ỏ",
        "O": "Ỏ",
        "ô": "ổ",
        "Ô": "Ổ",
        "ơ": "ở",
        "Ơ": "Ở",

        // U
        "ủ": "u",
        "Ủ": "U",
        "ử": "ư",
        "Ử": "Ư",
        "u": "ủ",
        "U": "Ủ",
        "ư": "ử",
        "Ư": "Ử",

        // Y
        "Ỷ": "y",
        "ỷ": "y",
        "y": "ỷ",
        "Y": "Ỷ",
        "": ""
    }

    const _mapNga = {
        "ã": "a",
        "Ã": "A",
        "a": "ã",
        "A": "Ã",
        "ă": "ẵ",
        "ẵ": "ă",
        "Ẵ": "Ă",
        "Ă": "Ẵ",
        "ẫ": "â",
        "Ẫ": "Â",
        "â": "ẫ",
        "Â": "Ẫ",

        // E
        "e": "ẽ",
        "E": "Ẽ",
        "ê": "ễ",
        "Ê": "Ễ",
        "ẽ": "e",
        "Ẽ": "E",
        "ễ": "ê",
        "Ễ": "Ê",

        // I
        "i": "ĩ",
        "I": "Ĩ",
        "ĩ": "i",
        "Ĩ": "I",

        // O
        "o": "õ",
        "O": "Õ",
        "õ": "o",
        "Õ": "O",

        "ô": "ỗ",
        "ỗ": "ô",
        "Ô": "Ỗ",
        "Ỗ": "Ô",

        "ơ": "ỡ",
        "Ơ": "Ỡ",
        "ỡ": "ơ",
        "Ỡ": "Ơ",

        // U
        "u": "ũ",
        "U": "Ũ",
        "ư": "ữ",
        "Ư": "Ữ",
        "ũ": "u",
        "Ũ": "U",
        "ữ": "ư",
        "Ữ": "Ư",

        // Y
        "y": "ỹ",
        "Y": "Ỹ",
        "ỹ": "y",
        "Ỹ": "Y",
        "": ""
    }

    const _mapNang = {
        "a": "ạ",
        "A": "Ạ",
        "ă": "ặ",
        "Ă": "Ặ",
        "â": "ậ",
        "Â": "Ậ",
        "e": "ẹ",
        "E": "Ẹ",
        "ê": "ệ",
        "Ê": "Ệ",
        "i": "ị",
        "I": "Ị",
        "o": "ọ",
        "O": "Ọ",
        "ô": "ộ",
        "Ô": "Ộ",
        "ơ": "ợ",
        "Ơ": "Ợ",
        "u": "ụ",
        "U": "Ụ",
        "ư": "ự",
        "Ư": "Ự",
        "y": "ỵ",
        "Y": "Ỵ",

        // Xóa dấu
        "ạ": "a",
        "Ạ": "A",
        "ặ": "ă",
        "Ặ": "Ă",
        "ậ": "â",
        "Ậ": "Ậ",
        "ẹ": "e",
        "Ẹ": "E",
        "ệ": "ê",
        "Ệ": "Ê",
        "ị": "i",
        "Ị": "I",
        "ọ": "o",
        "Ọ": "O",
        "ộ": "ô",
        "Ộ": "Ô",
        "ợ": "ơ",
        "Ợ": "Ơ",
        "ụ": "u",
        "Ụ": "U",
        "ự": "ư",
        "Ự": "Ư",
        "ỵ": "y",
        "Ỵ": "Y",
        "": ""
    }

    const _mapMu = {
        "a": "â",
        "A": "Â",
        "o": "ô",
        "O": "Ô",
        "e": "ê",
        "E": "Ê",

        "â": "a",
        "Â": "A",
        "ô": "o",
        "Ô": "O",
        "ê": "e",
        "Ê": "E",

        "": ""
    }

    const _mapMoc = {
        "o": "ơ",
        "O": "Ơ",
        "u": "ư",
        "U": "Ư",
        "": ""
    }

    const _mapTrang = {
        "a": "ă",
        "A": "Ă",
        "ă": "a",
        "Ă": "A",
        "": ""
    }

    const _mapNgang = {
        "d": "đ",
        "D": "Đ",
        "đ": "d",
        "Đ": "D",
        "": ""
    }

    function setup() {
        var e;
        var elements = document.body.getElementsByTagName("*");
        for (var i = 0; i < elements.length; i++) {
            e = elements[i];
            if ((e.type == "text") || (e.type == "textarea")) { // make sure it's valid
                // if (e.hasAttribute("data-vnkeys")) { e.onkeypress = keypressEventHandler; }
                if (e.hasAttribute("data-vnkeys")) {
                    e.oninput = inputEventHandler;
                }
            }
        }

        // Init cookies
        var cookieValue = getCookie(COOKIE_NAME, "auto");
        elements = document.getElementsByName("vnkeys_method");
        for (var i = 0; i < elements.length; i++) {
            e = elements[i];
            if (e.value == cookieValue) {
                e.checked = true;
                break;
            }
        }

    }

    // Cookie section 
    function setCookie(name, value, numberOfDays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + numberOfDays);
        var c_value = escape(value) + ((numberOfDays == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = name + "=" + c_value + ";path=/";
    }

    function deleteCookie(name) {
        this.setCookie(name, "", -1);
    }

    function getCookie(name, defaultValue) {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == name) {
                return unescape(y);
            }
        }
        return defaultValue;
    }
    // End cookies

    if (window.addEventListener) {
        window.addEventListener('load', setup);
    } else {
        window.attachEvent('onload', setup);
    }


}
