$(function () {

    // config Quill Editor v1.3.7
    var summernoteElements = $('.summernote');
    if (summernoteElements.length > 0) {
        summernoteElements.each(function (index, element) {
            var _quill = $(element);
            if (_quill.length > 0) {
                var _dataPlaceholder = _quill.data('placeholder');
                var toolbarOptions = [[{ header: [1, 2, false] }], ['bold', 'italic', 'underline'], ['image', 'code-block']];
                var quill = new Quill(element, {
                    modules: {
                        toolbar: toolbarOptions
                    },
                    placeholder: _dataPlaceholder,
                    theme: 'snow'
                });
            }
        });
    }

    /*
    function getToolbarSpecification() {
        return [
            { name: 'clipboard', groups: [ 'clipboard', 'undo' ],
                items: ['Undo', 'Redo' ] },
            { name: 'styles', groups: [ 'styles' ],
                items: [ 'Format' ] },
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ],
                items: [ 'Bold', 'Italic', 'Underline', 'Superscript', 'Subscript' ] },
            { name: 'paragraph', groups: [ 'list', 'align', 'indent', 'blocks', 'bidi', 'paragraph' ],
                items: [ 'NumberedList', 'BulletedList', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
            { name: 'links', groups: [ 'links' ], items: [ 'Link', 'Unlink', 'Anchor' ] },
            { name: 'insert', groups: [ 'insert' ], items: [ 'Image', 'Table', 'Video'] },
            { name: 'colors', groups: [ 'colors' ], items: [ 'TextColor', 'BGColor' ] },
            { name: 'tools', groups: [ 'tools' ], items: [ 'Maximize' ] },
            { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source' ] }
        ];
    }
      var _ckeditorSpecification = $('.ckeditor-specification');
    if (_ckeditorSpecification.length > 0) {
        _ckeditorSpecification.each(function() {
            var _placeholder = $(this).data('placeholder');
            CKEDITOR.replace(this, {
                skin: 'moono-lisa',
                toolbar: getToolbarSpecification(),
                editorplaceholder: _placeholder,
                extraPlugins: 'video'
            });
        });
    }
     */

    function getToolbarDefault() {
        return [{ name: 'clipboard', groups: ['clipboard', 'undo'],
            items: ['Undo', 'Redo'] }, { name: 'styles', groups: ['styles'],
            items: ['Format'] }, { name: 'basicstyles', groups: ['basicstyles', 'cleanup'],
            items: ['Bold', 'Italic', 'Underline', 'Superscript', 'Subscript'] }, { name: 'paragraph', groups: ['list', 'align', 'indent', 'blocks', 'bidi', 'paragraph'],
            items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] }, { name: 'links', groups: ['links'], items: ['Link', 'Unlink'] }];
    }

    var _ckeditor = $('.ck-editor');
    if (_ckeditor.length > 0) {
        _ckeditor.each(function () {
            var _placeholder = $(this).data('placeholder');
            CKEDITOR.replace(this, {
                skin: 'moono-lisa',
                toolbar: getToolbarDefault(),
                editorplaceholder: _placeholder
            });
        });
    }

    // config Flatpickr v4.6.13
    var _datePicker = $(".js-date-picker");
    if (_datePicker.length > 0) {
        _datePicker.flatpickr({
            enableTime: true,
            dateFormat: "Y-m-d H:i"
        });
    }

    var _dateRangePicker = $(".js-date-range-picker");
    if (_dateRangePicker.length > 0) {
        _dateRangePicker.daterangepicker({
            timePicker: true,
            startDate: moment().startOf("hour"),
            endDate: moment().startOf("hour").add(32, "hour"),
            locale: {
                format: "M/DD hh:mm A"
            }
        });
    }

    // config Repeater's
    $('#kt_docs_repeater_nested').repeater({
        initEmpty: false,

        defaultValues: {
            'text-input': 'foo'
        },

        show: function () {
            $(this).slideDown();

            // Re-init element
            $(this).find('[data-kt-repeater="select2"]').select2();

            var _variantCategory = $(this).find('.js-variant__category');
            _variantCategory.on('click', '.js-variant-category__add', function () {
                var _this = $(this);
                var _variantCategoryList = _this.closest('.js-variant__category');
                var _variantCategoryItem = _variantCategoryList.find('.js-variant__category-list');
                var totalIndex = $('.js-variant__category-item').map(function () {
                    return $(this).data('order');
                }).get();
                var _index = totalIndex ? Math.max.apply(Math, totalIndex) + 1 : _variantCategoryItem.find('.js-variant__category-item').length;
                var _rowHtml = `
                <li class="list-group-item js-variant__category-item border-0"
                    data-order="${_index}">
                    <div class="row">
                        <div class="col-md-4">
                            <select class="form-select" data-kt-repeater="select2" data-hide-search="false" data-allow-clear="true"
                                    data-placeholder="SKU type">
                                <option></option>
                                <option value="0">r1-black</option>
                                <option value="1">r2-black</option>
                                <option value="2">r6-black-hershey</option>
                                <option value="3">r6-rl-black</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <input type="text" name="sku" class="form-control" placeholder="Regional SKU" value=""/>
                        </div>
        
                        <div class="col-md-2 w-175px mt-3 js-manage__local d-none">
                            <a href="javascript:;" class="form-label text-hover-primary" data-bs-toggle="modal" data-bs-target="#modal-manage-subvariant">Local SKU overwrite</a>
                        </div>
                        <div class="col-md-1">
                            <a href="javascript:;" class="text-hover-success btn-add mt-1 js-variant-category__add">
                                <span class="svg-icon svg-icon-3x">
                                    <svg width="34" height="34" viewBox="0 0 34 34"
                                         fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.25" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                              fill="currentColor" />
                                        <path fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M17.0003 24.0833C17.7827 24.0833 18.417 23.4491 18.417 22.6667V18.4167H22.667C23.4494 18.4167 24.0837 17.7824 24.0837 17C24.0837 16.2176 23.4494 15.5833 22.667 15.5833H18.417V11.3333C18.417 10.5509 17.7827 9.91666 17.0003 9.91666C16.2179 9.91666 15.5837 10.5509 15.5837 11.3333V15.5833H11.3337C10.5513 15.5833 9.91699 16.2176 9.91699 17C9.91699 17.7824 10.5513 18.4167 11.3337 18.4167H15.5837V22.6667C15.5837 23.4491 16.2179 24.0833 17.0003 24.0833Z"
                                              fill="currentColor" />
                                    </svg>
                                </span>
                            </a>
                            <a href="javascript:;" class="text-hover-danger btn-remove mt-1 js-variant-category__remove d-none">
                                <span class="svg-icon svg-icon-3x">
                                    <svg width="34" height="34" viewBox="0 0 34 34"
                                         fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.25" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                              fill="currentColor" />
                                        <path
                                                d="M12.75 14.1667V22.5834C12.75 23.4118 13.4216 24.0834 14.25 24.0834H19.75C20.5784 24.0834 21.25 23.4118 21.25 22.5834V14.1667H12.75Z"
                                                fill="currentColor" />
                                        <path opacity="0.3" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M18.417 11.6875V11.625C18.417 11.0727 17.9693 10.625 17.417 10.625H16.5837C16.0314 10.625 15.5837 11.0727 15.5837 11.625V11.6875H12.542C12.2659 11.6875 12.042 11.9114 12.042 12.1875V12.25C12.042 12.5261 12.2658 12.75 12.542 12.75H21.4587C21.7348 12.75 21.9587 12.5261 21.9587 12.25V12.1875C21.9587 11.9114 21.7348 11.6875 21.4587 11.6875H18.417Z"
                                              fill="currentColor" />
                                    </svg>
                                </span>
                            </a>
                        </div>
                    </div>
                </li>
             `;
                _variantCategory.find('.btn-add').addClass('d-none');
                _variantCategory.find('.btn-remove').removeClass('d-none');
                _variantCategory.find('.js-manage__local').removeClass('d-none');
                _variantCategoryItem.append(_rowHtml);
                $('[data-kt-repeater="select2"]').select2();
            });

            _variantCategory.on('click', '.js-variant-category__remove', function () {
                $(this).closest('.js-variant__category-item').remove();
            });
        },

        hide: function (deleteElement) {
            // Delete element
            $(this).slideUp(deleteElement);
        },

        ready: function () {
            // Init select2
            $('[data-kt-repeater="select2"]').select2();

            var _variantCategory = $(this).find('.js-variant__category');
            _variantCategory.on('click', '.js-variant-category__add', function () {
                var _this = $(this);
                var _variantCategoryList = _this.closest('.js-variant__category');
                var _variantCategoryItem = _variantCategoryList.find('.js-variant__category-list');
                var totalIndex = $('.js-variant__category-item').map(function () {
                    return $(this).data('order');
                }).get();
                var _index = totalIndex ? Math.max.apply(Math, totalIndex) + 1 : _variantCategoryItem.find('.js-variant__category-item').length;
                var _rowHtml = `
                <li class="list-group-item js-variant__category-item border-0"
                    data-order="${_index}">
                    <div class="row">
                        <div class="col-md-4">
                            <select class="form-select" data-kt-repeater="select2" data-hide-search="false" data-allow-clear="true"
                                    data-placeholder="SKU type">
                                <option></option>
                                <option value="0">r1-black</option>
                                <option value="1">r2-black</option>
                                <option value="2">r6-black-hershey</option>
                                <option value="3">r6-rl-black</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <input type="text" name="sku" class="form-control" placeholder="Regional SKU" value=""/>
                        </div>
        
                        <div class="col-md-2 w-175px mt-3 js-manage__local d-none">
                            <a href="javascript:;" class="form-label text-hover-primary" data-bs-toggle="modal" data-bs-target="#modal-manage-subvariant">Local SKU overwrite</a>
                        </div>
                        <div class="col-md-1">
                            <a href="javascript:;" class="text-hover-success btn-add mt-1 js-variant-category__add">
                                <span class="svg-icon svg-icon-3x">
                                    <svg width="34" height="34" viewBox="0 0 34 34"
                                         fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.25" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                              fill="currentColor" />
                                        <path fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M17.0003 24.0833C17.7827 24.0833 18.417 23.4491 18.417 22.6667V18.4167H22.667C23.4494 18.4167 24.0837 17.7824 24.0837 17C24.0837 16.2176 23.4494 15.5833 22.667 15.5833H18.417V11.3333C18.417 10.5509 17.7827 9.91666 17.0003 9.91666C16.2179 9.91666 15.5837 10.5509 15.5837 11.3333V15.5833H11.3337C10.5513 15.5833 9.91699 16.2176 9.91699 17C9.91699 17.7824 10.5513 18.4167 11.3337 18.4167H15.5837V22.6667C15.5837 23.4491 16.2179 24.0833 17.0003 24.0833Z"
                                              fill="currentColor" />
                                    </svg>
                                </span>
                            </a>
                            <a href="javascript:;" class="text-hover-danger btn-remove mt-1 js-variant-category__remove d-none">
                                <span class="svg-icon svg-icon-3x">
                                    <svg width="34" height="34" viewBox="0 0 34 34"
                                         fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.25" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                              fill="currentColor" />
                                        <path
                                                d="M12.75 14.1667V22.5834C12.75 23.4118 13.4216 24.0834 14.25 24.0834H19.75C20.5784 24.0834 21.25 23.4118 21.25 22.5834V14.1667H12.75Z"
                                                fill="currentColor" />
                                        <path opacity="0.3" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M18.417 11.6875V11.625C18.417 11.0727 17.9693 10.625 17.417 10.625H16.5837C16.0314 10.625 15.5837 11.0727 15.5837 11.625V11.6875H12.542C12.2659 11.6875 12.042 11.9114 12.042 12.1875V12.25C12.042 12.5261 12.2658 12.75 12.542 12.75H21.4587C21.7348 12.75 21.9587 12.5261 21.9587 12.25V12.1875C21.9587 11.9114 21.7348 11.6875 21.4587 11.6875H18.417Z"
                                              fill="currentColor" />
                                    </svg>
                                </span>
                            </a>
                        </div>
                    </div>
                </li>
             `;
                _variantCategory.find('.btn-add').addClass('d-none');
                _variantCategory.find('.btn-remove').removeClass('d-none');
                _variantCategory.find('.js-manage__local').removeClass('d-none');
                _variantCategoryItem.append(_rowHtml);
                $('[data-kt-repeater="select2"]').select2();
            });

            _variantCategory.on('click', '.js-variant-category__remove', function () {
                $(this).closest('.js-variant__category-item').remove();
            });
        }
    });

    //Custom Nestable jQuery Plugin
    $('[data-level="five-level"]').each(function () {
        $(this).nestable({
            maxDepth: 5,
            threshold: 20,
            group: $(this).prop('id')
        });
    });

    $('[data-level="two-level"]').each(function () {
        $(this).nestable({
            maxDepth: 2,
            threshold: 20,
            group: $(this).prop('id')
        });
    });

    $('[data-level="one-level"]').each(function () {
        $(this).nestable({
            maxDepth: 1,
            threshold: 20,
            group: $(this).prop('id')
        });
    });

    $('[data-level="null-level"]').each(function () {
        $(this).nestable({
            maxDepth: 0,
            threshold: 20,
            group: $(this).prop('id')
        });
    });

    var _nested = $(".js-nestable");
    var _nestedList = _nested.find('.dd-list');
    if (_nestedList.length > 0) {
        $('.js-nestable__button_add').on('click', function () {
            var rowHtml = '<li class="dd-item"\n' + '                                                data-id="1"\n' + '                                                data-name=""\n' + '                                                data-page-headline=""\n' + '                                                data-url=""\n' + '                                                data-new=""\n' + '                                                data-location=""\n' + '                                                data-site=""\n' + '                                                data-language="">\n' + '                                                <div class="dd-btn-group">\n' + '                                                    <button type="button" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modal-edit-product-specification">Edit</button>\n' + '                                                    <a href="javascript:;" class="m-2" data-action="addRowAbove">\n' + '                                                        <span class="svg-icon svg-icon-3x">\n' + '                                                            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">\n' + '                                                                <path opacity="0.25" fill-rule="evenodd" clip-rule="evenodd" d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z" fill="#50CD89"/>\n' + '                                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0003 24.0833C17.7827 24.0833 18.417 23.4491 18.417 22.6667V18.4167H22.667C23.4494 18.4167 24.0837 17.7824 24.0837 17C24.0837 16.2176 23.4494 15.5833 22.667 15.5833H18.417V11.3333C18.417 10.5509 17.7827 9.91666 17.0003 9.91666C16.2179 9.91666 15.5837 10.5509 15.5837 11.3333V15.5833H11.3337C10.5513 15.5833 9.91699 16.2176 9.91699 17C9.91699 17.7824 10.5513 18.4167 11.3337 18.4167H15.5837V22.6667C15.5837 23.4491 16.2179 24.0833 17.0003 24.0833Z" fill="#50CD89"/>\n' + '                                                            </svg>\n' + '                                                        </span>\n' + '                                                    </a>\n' + '                                                    <a href="javascript:;" class="" data-action="removeRow">\n' + '                                                        <span class="svg-icon svg-icon-3x">\n' + '                                                            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">\n' + '                                                                <path opacity="0.25" fill-rule="evenodd" clip-rule="evenodd" d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z" fill="#50CD89"/>\n' + '                                                                <path d="M12.75 14.1667V22.5834C12.75 23.4118 13.4216 24.0834 14.25 24.0834H19.75C20.5784 24.0834 21.25 23.4118 21.25 22.5834V14.1667H12.75Z" fill="#50CD89"/>\n' + '                                                                <path opacity="0.3" fill-rule="evenodd" clip-rule="evenodd" d="M18.417 11.6875V11.625C18.417 11.0727 17.9693 10.625 17.417 10.625H16.5837C16.0314 10.625 15.5837 11.0727 15.5837 11.625V11.6875H12.542C12.2659 11.6875 12.042 11.9114 12.042 12.1875V12.25C12.042 12.5261 12.2658 12.75 12.542 12.75H21.4587C21.7348 12.75 21.9587 12.5261 21.9587 12.25V12.1875C21.9587 11.9114 21.7348 11.6875 21.4587 11.6875H18.417Z" fill="#50CD89"/>\n' + '                                                            </svg>\n' + '                                                        </span>\n' + '                                                    </a>\n' + '                                                </div>\n' + '                                                <div class="dd-handle">New Label</div>\n' + '                                            </li>';

            _nestedList.last().append(rowHtml);
            $(this).closest('.js-nestable__add').hide();
            _nested.data("changed", true);
        });
    }

    var _nestableElement = $("#nestable");
    if (_nestableElement.length > 0) {
        _nestableElement.on('change', function () {
            _nested.data("changed", true);
            if (_nestedList.find('.dd-item').length < 1) {
                _nested.find('.js-nestable__add').show();
            }
        });
    }

    // Custom profile
    var _labelProfile = $('.js-label-profile').text();
    if (_labelProfile.length > 0) {
        var _firstLetter = _labelProfile.charAt(0);
        $('.js-box-profile').text(_firstLetter);
    }

    //Config DropzoneJS
    var _dropzoneElement = $('.dropzone');
    if (_dropzoneElement.length > 0) {
        _dropzoneElement.each(function () {
            var _dropzoneElement = $(this);
            var _url = _dropzoneElement.data("url");
            var _paramName = _dropzoneElement.data("param-name");
            var _maxFiles = _dropzoneElement.data("max-file");
            var _maxFilesize = _dropzoneElement.data("max-filezise");
            var _addRemoveLinks = _dropzoneElement.data("add-remove-links");

            var myDropzone = new Dropzone(_dropzoneElement[0], {
                url: _url,
                paramName: _paramName,
                maxFiles: _maxFiles,
                maxFilesize: _maxFilesize, // MB
                addRemoveLinks: _addRemoveLinks
            });
        });
    }

    var _dropzoneWrapper = $('.dropzone__wrapper');
    if (_dropzoneWrapper.length > 0) {
        _dropzoneWrapper.sortable({
            animation: 150,
            cursor: "move",
            tolerance: "pointer",
            placeholder: "dropzone-placeholder",
            connectWith: "dropzone__wrapper",
            sort: true
        });
    }
    //End DropzoneJS

    var _listSortable = $(".list-group__sort");
    if (_listSortable.length > 0) {
        _listSortable.sortable({
            axis: "y",
            animation: 150,
            cursor: "move",
            tolerance: "pointer",
            placeholder: "list-group__placeholder",
            connectWith: "list-group__sort",
            sort: true
        });
    }

    var _pagination = $('.js-pagination');
    if (_pagination.length > 0) {
        _pagination.keypress(function (e) {
            var keyCode = e.which;
            if (keyCode < 48 || keyCode > 57) {
                e.preventDefault();
            }
        });
    }

    // Config tagsify
    var _tagsify = $('.tagsify');
    if (_tagsify.length > 0) {
        _tagsify.each(function () {
            new Tagify(this);
        });
    }

    var _tagList = $('#tag-list');
    if (_tagList.length > 0) {
        var _whitelist = _tagList.data('tag-list');
        var tagify = new Tagify(document.querySelector('#tag-list'), {
            delimiters: null,
            templates: {
                tag: function (tagData) {
                    try {
                        return `<tag title='${tagData.value}' contenteditable='false' spellcheck="false"
                                    class='tagify__tag ${tagData.class ? tagData.class : ""}' ${this.getAttributes(tagData)}>
                                    <x title='remove tag' class='tagify__tag__removeBtn'></x>
                                    <div class="d-flex align-items-center">
                                        <span class='tagify__tag-text'>${tagData.value}</span>
                                    </div>
                                </tag>`;
                    } catch (err) {}
                },

                dropdownItem: function (tagData) {
                    try {
                        return `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}'>
                                    <span>${tagData.value}</span>
                                </div>`;
                    } catch (err) {}
                }
            },
            enforceWhitelist: false,
            whitelist: _whitelist,
            dropdown: {
                enabled: 0,
                classname: 'extra-properties'
            }
        });

        var tagsToAdd = tagify.settings.whitelist.slice(0, 0);
        tagify.addTags(tagsToAdd);
    }

    // Copy text to clipboard. For more info check the plugin's documentation: https://clipboardjs.com/
    function initializeClipboard(elementId) {
        var _button = document.querySelector('#' + elementId + '-btn');
        var _input = document.querySelector('#' + elementId + '-input');

        if (!_button || !_input) {
            return;
        }

        var _clipboard = new ClipboardJS(_button);

        _clipboard.on('success', function (e) {
            var _buttonCaption = _button.innerHTML;
            _input.classList.add('bg-light-success');
            _button.innerHTML = 'Copied!';

            setTimeout(function () {
                _button.innerHTML = _buttonCaption;
                _input.classList.remove('bg-light-success');
            }, 3000);

            e.clearSelection();
        });
    }

    initializeClipboard('clipboard');
    initializeClipboard('clipboard1');

    // Config bootstrapDualListbox
    var $dualSelect = $('.dual_select');
    if ($dualSelect.length > 0) {
        $(".dual_select").each(function (e) {
            var findTitle1 = $(this).find('data-titleSelected'),
                findTitle2 = $(this).find('data-titleNonSelected'),
                titleSelected = $(this).data('titleselected'),
                titleNonSelected = $(this).data('titleunselected');
            if (findTitle1 !== undefined) {
                $(this).bootstrapDualListbox({
                    filterTextClear: false,
                    selectedListLabel: titleSelected,
                    nonSelectedListLabel: titleNonSelected,
                    moveOnSelect: false,
                    moveOnDoubleClick: true,
                    sortByInputOrder: true,
                    selectorMinimalHeight: 160
                });
            } else if (findTitle2 !== undefined) {
                $(this).bootstrapDualListbox({
                    filterTextClear: false,
                    selectedListLabel: titleSelected,
                    nonSelectedListLabel: titleNonSelected,
                    moveOnSelect: false,
                    moveOnDoubleClick: true,
                    sortByInputOrder: true,
                    selectorMinimalHeight: 160
                });
            } else {
                $(this).bootstrapDualListbox({
                    moveOnSelect: false,
                    moveOnDoubleClick: true,
                    sortByInputOrder: true,
                    selectorMinimalHeight: 160
                });
            }
        });
    }
});
$(function () {
    let imgThumbTemplate = function (data) {
        let html = `<div class="dropzone__content">
            <div class="image-input image-input-outline">
                <div class="image-input-wrapper w-150px h-150px" style="background-image: url('` + data.imgUrl + `')"></div>
                <span class="btn btn-icon btn-circle btn-color-muted btn-active-color-primary dam-action-edit w-25px h-25px bg-body shadow js-dam-alt"
                    data-action-url="` + data.actionUrl + `"
                    data-modal-alt="true" 
                    data-get-alt-url="` + data.getAltUrl + `" 
                    data-id=` + data.id + `>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.1381 2.98661C14.7155 3.56402 14.725 4.49722 14.1594 5.08622L8.74248 10.7273C8.46719 11.014 8.08938 11.1797 7.69201 11.188L5.41668 11.2358L5.46474 8.94521C5.47289 8.55688 5.63135 8.18685 5.90679 7.91298L11.4438 2.40759C12.0301 1.82467 12.9775 1.82602 13.5621 2.41062L14.1381 2.98661Z" fill="#A1A5B7"/>
                        <path opacity="0.3" d="M8.59992 1.3335C8.96811 1.3335 9.26659 1.63197 9.26659 2.00016C9.26659 2.36835 8.96811 2.66683 8.59992 2.66683H3.99992C3.26354 2.66683 2.66659 3.26378 2.66659 4.00016V12.0002C2.66659 12.7365 3.26354 13.3335 3.99992 13.3335H11.9999C12.7363 13.3335 13.3333 12.7365 13.3333 12.0002V8.66683C13.3333 8.29864 13.6317 8.00016 13.9999 8.00016C14.3681 8.00016 14.6666 8.29864 14.6666 8.66683V12.0002C14.6666 13.4729 13.4727 14.6668 11.9999 14.6668H3.99992C2.52716 14.6668 1.33325 13.4729 1.33325 12.0002V4.00016C1.33325 2.5274 2.52716 1.3335 3.99992 1.3335H8.59992Z" fill="#A1A5B7"/>
                    </svg>
                </span>
                <span class="btn btn-icon btn-circle btn-color-muted btn-active-color-primary dam-action-remove w-25px h-25px bg-body shadow js-del-thumbnail">
                    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.40864 6.49829L11.7045 2.21244C11.8926 2.02431 11.9983 1.76917 11.9983 1.50312C11.9983 1.23708 11.8926 0.98193 11.7045 0.793808C11.5164 0.605686 11.2612 0.5 10.9952 0.5C10.7291 0.5 10.474 0.605686 10.2859 0.793808L6 5.08966L1.71414 0.793808C1.52602 0.605686 1.27087 0.5 1.00483 0.5C0.738783 0.5 0.483635 0.605686 0.295513 0.793808C0.107391 0.98193 0.00170495 1.23708 0.00170495 1.50312C0.00170495 1.76917 0.107391 2.02431 0.295513 2.21244L4.59136 6.49829L0.295513 10.7842C0.201875 10.877 0.127553 10.9875 0.0768329 11.1093C0.0261132 11.231 0 11.3616 0 11.4935C0 11.6254 0.0261132 11.7559 0.0768329 11.8777C0.127553 11.9994 0.201875 12.1099 0.295513 12.2028C0.388386 12.2964 0.49888 12.3707 0.620622 12.4215C0.742363 12.4722 0.872943 12.4983 1.00483 12.4983C1.13671 12.4983 1.26729 12.4722 1.38903 12.4215C1.51077 12.3707 1.62127 12.2964 1.71414 12.2028L6 7.90693L10.2859 12.2028C10.3787 12.2964 10.4892 12.3707 10.611 12.4215C10.7327 12.4722 10.8633 12.4983 10.9952 12.4983C11.1271 12.4983 11.2576 12.4722 11.3794 12.4215C11.5011 12.3707 11.6116 12.2964 11.7045 12.2028C11.7981 12.1099 11.8724 11.9994 11.9232 11.8777C11.9739 11.7559 12 11.6254 12 11.4935C12 11.3616 11.9739 11.231 11.9232 11.1093C11.8724 10.9875 11.7981 10.877 11.7045 10.7842L7.40864 6.49829Z" fill="#B5B5C3"/>
                    </svg>
                </span>
            </div>
        </div>`;
        return html;
    };
    // Config DAM
    var _damItem = $(".dam-item");
    if (_damItem.length > 0) {
        _damItem.on('click', function () {
            _damItem.removeClass("dam-selected");
            $(this).addClass("dam-selected");
        });
    }

    $('.js-dam-modal').on('click', function () {
        $(this).dam({
            actionUrl: '/images',
            hasList: false,
            maxFileSize: 1024,
            showDate: true,
            onSuccess: function (response) {
                console.log(response);
            },
            onError: function (response) {
                console.log(response);
            }
        });
    });

    let addImageBtn = $('.js-dam-category');
    addImageBtn.on('click', function () {

        // let response = {
        //     "altText": "Apakah",
        //     "copyright": "apakah",
        //     "fileName": "ca8dacf51f1c46c39e639c12dc88ced3_1.png-362x320.png",
        //     "id": 1,
        //     "title": "Testing",
        //     "url": "https://asia.canon/media/image/2022/09/16/ca8dacf51f1c46c39e639c12dc88ced3_1.png-362x320.png",
        //     "altUrl": "/images",
        //     "saveAltUrl": "/save",
        //     "languages": {
        //         "en": "English",
        //         "id": "Indonesian",
        //         "th": "Thailand"
        //     }
        // }

        let _self = $(this);
        let parent = _self.closest('.dropzone__wrapper');

        // _self.addClass('d-none');

        // let temp = imgThumbTemplate({
        //     id: response.id,
        //     imgUrl: response.url,
        //     actionUrl: response.saveAltUrl,
        //     languages: JSON.stringify(response.languages)
        // });

        // parent.append(temp);

        $(this).dam({
            hasList: false,
            // maxFileSize: 1024,
            // showDate: true,
            onSuccess: function (response) {
                if (response) {
                    _self.addClass('d-none');

                    let temp = imgThumbTemplate({
                        id: response.id,
                        imgUrl: response.url,
                        getAltUrl: response.altUrl,
                        actionUrl: response.saveAltUrl,
                        languages: JSON.stringify(response.languages)
                    });

                    parent.append(temp);
                }
            },
            onError: function (response) {
                console.log(response);
            }
        });
    });

    $('body').on('click', '.js-dam-alt', function () {
        let _self = $(this);
        let _id = _self.data('id');
        let _url = _self.data('get-alt-url');
        $.ajax({
            method: 'get',
            url: _url
        }).done(function (response) {
            if (response) {
                _self.dam({
                    languages: response,
                    onSuccess: function (response) {
                        console.log(response);
                    },
                    onError: function (response) {
                        console.log(response);
                    }
                });
            }
        }).fail(function (jqXHR, textStatus) {
            console.log(jqXHR);
        });

        // let response = {
        //     "en": {
        //       "label": "English",
        //       "value": ""
        //     },
        //     "id": {
        //       "label": "Indonesian",
        //       "value": "adsad"
        //     },
        //     "th": {
        //       "label": "Thailand",
        //       "value": "12esqw"
        //     }
        // };

        // _self.dam({
        //     languages: response,
        //     onSuccess: function(response){
        //         console.log(response)
        //     },
        //     onError: function(response){
        //         console.log(response);
        //     }
        // });

    });

    $('body').on('click', '.js-del-thumbnail', function () {
        let _this = $(this);
        let _dropzoneContent = _this.closest('.dropzone__content');
        let _dropzoneWrapper = _this.closest('.dropzone__wrapper');
        let _damCategory = _dropzoneWrapper.find('.js-dam-category');
        _dropzoneContent.remove();
        _damCategory.removeClass('d-none');
    });
});
$(function () {
    /**
     * Updates the visibility of "move up" and "move down" buttons for a <ul> list.
     *
     * @returns {void}
     */
    function updateReorderButtonsForList() {
        $(".js-move__up").show();
        $(".js-move__down").show();

        var $firstItem = $("ul li:first-child");
        var $lastItem = $("ul li:last-child");
        $firstItem.find(".js-move__up").hide();
        $lastItem.find(".js-move__down").hide();
    }

    /**
     * Updates the visibility of "move up" and "move down" buttons for a <tbody> table.
     *
     * @returns {void}
     */
    function updateReorderButtonsForTable() {
        $(".js-product-gallery-move__up").show();
        $(".js-product-gallery-move__down").show();

        var $firstItem = $("tbody tr:first-child");
        var $lastItem = $("tbody tr:last-child");
        $firstItem.find(".js-product-gallery-move__up").hide();
        $lastItem.find(".js-product-gallery-move__down").hide();
    }

    var _groupedProduct = $('.js-grouped-product');
    if (_groupedProduct.length > 0) {
        _groupedProduct.on('click', function () {
            var _this = $(this);
            var _card = _this.closest('.card');
            var _isGrouped = _this.data('isGrouped');
            var _groupedLabel = _this.data('group-label');
            var _ungroupedLabel = _this.data('ungroup-label');

            if (_isGrouped) {
                _card.find('.js-variant-category').removeClass('d-none');
                _card.find('.js-variant-category-grouped').addClass('d-none');

                _card.find('.js-menu-action').removeClass('d-none');
                _card.find('.js-menu-variant').addClass('d-none');

                _card.find('.js-card-toolbar').removeClass('d-none');
                _groupedProduct.text(_ungroupedLabel);
            } else {
                _card.find('.js-variant-category').addClass('d-none');
                _card.find('.js-variant-category-grouped').removeClass('d-none');

                _card.find('.js-menu-action').addClass('d-none');
                _card.find('.js-menu-variant').removeClass('d-none');

                _card.find('.js-card-toolbar').addClass('d-none');
                _groupedProduct.text(_groupedLabel);
            }

            _this.data('isGrouped', !_isGrouped);
        });
    }

    var _sellingPoint = $(".js-selling-point");
    if (_sellingPoint.length > 0) {
        _sellingPoint.on('click', '.js-selling-point__add', function () {
            var _this = $(this);
            var _sellingPointList = _this.closest('.js-selling-point');
            var _sellingPointItem = _sellingPointList.find('.js-selling-point__list');
            var totalIndex = $(".js-selling-point__item").map(function () {
                return $(this).data('order');
            }).get();
            var _index = totalIndex ? Math.max.apply(Math, totalIndex) + 1 : _sellingPointItem.find('.js-selling-point__item').length;
            var _rowHtml = `
              <li class="list-group-item js-selling-point__item border-0 d-flex justify-content-between align-content-center gap-4"
                    data-order="${_index}">
                    <div class="btn-group-vertical mt-0">
                        <a href="javascript:;" class="js-move__up text-hover-gray-800">
                             <span class="svg-icon svg-icon-1x">
                                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 6' fill='currentColor'>
                                    <path d='M3.23571 2.72011L4.97917 4.46358C5.15176 4.63618 5.43158 4.63617 5.60417 4.46358C5.77676 4.29099 5.77676 4.01118 5.60417 3.83861L3.29463 1.52904C3.13192 1.36629 2.86809 1.36629 2.70538 1.52904L0.395812 3.83861C0.22325 4.01117 0.22325 4.29099 0.395812 4.46358C0.568437 4.63617 0.84825 4.63617 1.02081 4.46358L2.76429 2.72011C2.89446 2.58994 3.10554 2.58994 3.23571 2.72011Z'/></svg>
                             </span>
                        </a>
                        <a href="javascript:;" class="js-move__down text-hover-gray-800">
                         <span class="svg-icon svg-icon-1x">
                             <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 6' fill='currentColor'>
                                 <path d='M2.76429 3.27989L1.02083 1.53642C0.848244 1.36382 0.568419 1.36383 0.395831 1.53642C0.223244 1.70901 0.223244 1.98882 0.395831 2.16139L2.70537 4.47096C2.86808 4.63371 3.13191 4.63371 3.29462 4.47096L5.60419 2.16139C5.77675 1.98883 5.77675 1.70901 5.60419 1.53642C5.43156 1.36383 5.15175 1.36383 4.97919 1.53642L3.23571 3.27989C3.10554 3.41006 2.89446 3.41006 2.76429 3.27989Z'/></svg>
                         </span>
                        </a>
                    </div>
                    <input type="text" name="sellingPoint" class="form-control" placeholder="" value=""/>
                    <a href="javascript:;" class="text-hover-success btn-add mt-1 js-selling-point__add">
                        <span class="svg-icon svg-icon-3x">
                            <svg width="34" height="34" viewBox="0 0 34 34"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.25" fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                      fill="currentColor" />
                                <path fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M17.0003 24.0833C17.7827 24.0833 18.417 23.4491 18.417 22.6667V18.4167H22.667C23.4494 18.4167 24.0837 17.7824 24.0837 17C24.0837 16.2176 23.4494 15.5833 22.667 15.5833H18.417V11.3333C18.417 10.5509 17.7827 9.91666 17.0003 9.91666C16.2179 9.91666 15.5837 10.5509 15.5837 11.3333V15.5833H11.3337C10.5513 15.5833 9.91699 16.2176 9.91699 17C9.91699 17.7824 10.5513 18.4167 11.3337 18.4167H15.5837V22.6667C15.5837 23.4491 16.2179 24.0833 17.0003 24.0833Z"
                                      fill="currentColor" />
                            </svg>
                        </span>
                    </a>
                    <a href="javascript:;" class="text-hover-danger btn-remove mt-1 js-selling-point__remove d-none">
                        <span class="svg-icon svg-icon-3x">
                            <svg width="34" height="34" viewBox="0 0 34 34"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.25" fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                      fill="currentColor" />
                                <path
                                        d="M12.75 14.1667V22.5834C12.75 23.4118 13.4216 24.0834 14.25 24.0834H19.75C20.5784 24.0834 21.25 23.4118 21.25 22.5834V14.1667H12.75Z"
                                        fill="currentColor" />
                                <path opacity="0.3" fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M18.417 11.6875V11.625C18.417 11.0727 17.9693 10.625 17.417 10.625H16.5837C16.0314 10.625 15.5837 11.0727 15.5837 11.625V11.6875H12.542C12.2659 11.6875 12.042 11.9114 12.042 12.1875V12.25C12.042 12.5261 12.2658 12.75 12.542 12.75H21.4587C21.7348 12.75 21.9587 12.5261 21.9587 12.25V12.1875C21.9587 11.9114 21.7348 11.6875 21.4587 11.6875H18.417Z"
                                      fill="currentColor" />
                            </svg>
                        </span>
                    </a>
                </li>
            `;

            $('.btn-add').addClass('d-none');
            $('.btn-remove').removeClass('d-none');
            $('.btn-group-vertical').removeClass('d-none');

            _sellingPointItem.append(_rowHtml);
            updateReorderButtonsForList();
        });

        updateReorderButtonsForList();
        _sellingPoint.on('click', '.js-move__up', function () {
            var $current = $(this).closest('.js-selling-point__item');
            var $previous = $current.prev('.js-selling-point__item');
            if ($previous.length !== 0) {
                $current.insertBefore($previous);
                updateReorderButtonsForList();
            }
            return false;
        });

        _sellingPoint.on('click', '.js-move__down', function () {
            var $current = $(this).closest('.js-selling-point__item');
            var $next = $current.next('.js-selling-point__item');
            if ($next.length !== 0) {
                $current.insertAfter($next);
                updateReorderButtonsForList();
            }
            return false;
        });

        _sellingPoint.on('click', '.js-selling-point__remove', function () {
            $(this).closest('.js-selling-point__item').remove();
            updateReorderButtonsForList();
        });
    }

    var _productGallery = $('.js-product-gallery');
    if (_productGallery.length > 0) {
        updateReorderButtonsForTable();
        _productGallery.on('click', '.js-product-gallery-move__up', function () {
            var $current = $(this).closest('.js-product-gallery__item');
            var $previous = $current.prev('.js-product-gallery__item');
            if ($previous.length !== 0) {
                $current.insertBefore($previous);
                updateReorderButtonsForTable();
            }
            return false;
        });

        _productGallery.on('click', '.js-product-gallery-move__down', function () {
            var $current = $(this).closest('.js-product-gallery__item');
            var $next = $current.next('.js-product-gallery__item');
            if ($next.length !== 0) {
                $current.insertAfter($next);
                updateReorderButtonsForTable();
            }
            return false;
        });

        _productGallery.on('click', '.js-product-gallery__remove', function () {
            $(this).closest('.js-product-gallery__item').remove();
            updateReorderButtonsForTable();
        });
    }

    $(".js-consumable__list").on("click", ".js-btn-remove", function () {
        var _this = $(this);
        var _consumableCard = _this.closest(".js-consumable__card");
        var _consumableBody = _consumableCard.find(".js-consumable__body");
        _this.closest(".list-group__item, .list-group").remove();

        var _items = _consumableBody.find('.list-group__item');
        if (_items.length < 1) {
            _consumableBody.addClass('d-none');
        }
    });

    $('.js-consumable__save').on('click', function () {
        var _multipleSelected = $("#consumable option").map(function (i, el) {
            return $(el);
        }).get();

        if (_multipleSelected.length > 0) {
            $.each(_multipleSelected, function (index, element) {
                var _isExisting = $('.js-consumable__list').find('.js-consumable__name').filter(function () {
                    return $(this).text() === element;
                }).length > 0;

                var _rowHtml;
                if (element.val() === "is_package_default") {
                    _rowHtml = `
                          <li class="list-group__item">
                               <div class="d-flex justify-content-between align-items-center">
                                    <span class="fw-semibold text-gray-900 mb-2">${element.text()}</span>
                                    <button type="button" class="btn btn-danger btn-sm js-btn-remove">Remove</button>
                               </div>
                               <input type="text" name="supportKey" class="form-control mb-2 mt-5"
                                       placeholder="Type in page field" value=""/>
                               <div class="form-check">
                                    <input class="form-check-input form-check-sm form-check-custom form-check-solid me-3" type="checkbox" value="" checked />
                                    <label class="form-label">Default Package</label>
                               </div>
                           </li>
                        `;
                } else if (element.val() === "not_package_default") {
                    _rowHtml = `
                        <li class="list-group__item">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-semibold text-gray-900 mb-2">${element.text()}</span>
                                <button type="button" class="btn btn-danger btn-sm js-btn-remove">Remove</button>
                            </div>
                            <input type="text" name="supportKey" class="form-control mb-2 mt-5"
                                   placeholder="Type in page field" value=""/>
                        </li>
                    `;
                } else {
                    _rowHtml = `
                          <li class="list-group__item">
                            <div class="d-flex justify-content-between align-items-center">
                              <span class="fw-semibold text-gray-900 mb-2 js-consumable__name">${element.text()}</span>
                              <button type="button" class="btn btn-danger btn-sm js-btn-remove">Remove</button>
                            </div>
                          </li>
                    `;
                }

                if (!_isExisting) {
                    $('.js-consumable__list').append(_rowHtml);
                }
            });

            $('.js-consumable__body').removeClass('d-none');
        }
    });

    $(".js-accessories__list").on("click", ".js-btn-remove", function () {
        var _this = $(this);
        var _accessoriesCard = _this.closest(".js-accessories__card");
        var _accessoriesBody = _accessoriesCard.find(".js-accessories__body");
        _this.closest(".list-group__item, .list-group").remove();

        var _items = _accessoriesBody.find('.list-group__item');
        if (_items.length < 1) {
            _accessoriesBody.addClass('d-none');
        }
    });

    $('.js-accessories__save').on('click', function () {
        var _multipleSelected = $("#accessories option").map(function (i, el) {
            return $(el).text();
        }).get();

        if (_multipleSelected.length > 0) {
            $.each(_multipleSelected, function (index, element) {
                var _isExisting = $('.js-accessories__list').find('.js-accessories__name').filter(function () {
                    return $(this).text() === element;
                }).length > 0;

                var _rowHtml = `
                      <li class="list-group__item">
                        <div class="d-flex justify-content-between align-items-center">
                          <span class="fw-semibold text-gray-900 mb-2 js-accessories__name">${element}</span>
                          <button type="button" class="btn btn-danger btn-sm js-btn-remove">Remove</button>
                        </div>
                      </li>
                    `;

                if (!_isExisting) {
                    $('.js-accessories__list').append(_rowHtml);
                }
            });

            $('.js-accessories__body').removeClass('d-none');
        }
    });

    $(".js-compatible-product__list").on("click", ".js-btn-remove", function () {
        var _this = $(this);
        var _compatibleProductCard = _this.closest(".js-compatible-product__card");
        var _compatibleProductBody = _compatibleProductCard.find(".js-compatible-product__body");

        _this.closest('[data-bs-toggle="tooltip"]').tooltip('dispose');
        _this.closest(".list-group__item, .list-group").remove();

        var _items = _compatibleProductBody.find('.list-group__item');
        if (_items.length < 1) {
            _compatibleProductBody.addClass('d-none');
        }
    });

    $('.js-compatible-product__save').on('click', function () {
        var _multipleSelected = $("#compatible-product option").map(function (i, el) {
            return $(el).text();
        }).get();

        if (_multipleSelected.length > 0) {
            $.each(_multipleSelected, function (index, element) {
                var _isExisting = $('.js-compatible-product__list').find('.js-compatible-product__name').filter(function () {
                    return $(this).text() === element;
                }).length > 0;

                var _rowHtml = `
                        <li class="list-group__item sort-item" data-bs-toggle="tooltip" data-bs-placement="top" title="Change order">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-semibold text-gray-900 mb-2 js-compatible-product__name">${element}</span>
                                <button type="button" class="btn btn-danger btn-sm js-btn-remove">Remove</button>
                            </div>
                        </li>
                    `;

                if (!_isExisting) {
                    $('.js-compatible-product__list').append(_rowHtml).find(".list-group__item").tooltip();
                }
            });

            $('.js-compatible-product__body').removeClass('d-none');
        }
    });

    $(".js-compatible-software__list").on("click", ".js-btn-remove", function () {
        var _this = $(this);
        var _compatibleProductCard = _this.closest(".js-compatible-software__card");
        var _compatibleProductBody = _compatibleProductCard.find(".js-compatible-software__body");

        _this.closest('[data-bs-toggle="tooltip"]').tooltip('dispose');
        _this.closest(".list-group__item, .list-group").remove();

        var _items = _compatibleProductBody.find('.list-group__item');
        if (_items.length < 1) {
            _compatibleProductBody.addClass('d-none');
        }
    });

    $('.js-compatible-software__save').on('click', function () {
        var _multipleSelected = $("#compatible-software option").map(function (i, el) {
            return $(el).text();
        }).get();

        if (_multipleSelected.length > 0) {
            $.each(_multipleSelected, function (index, element) {
                var _isExisting = $('.js-compatible-software__list').find('.js-compatible-software__name').filter(function () {
                    return $(this).text() === element;
                }).length > 0;

                var _rowHtml = `
                        <li class="list-group__item sort-item" data-bs-toggle="tooltip" data-bs-placement="top" title="Change order">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-semibold text-gray-900 mb-2 js-compatible-software__name">${element}</span>
                                <button type="button" class="btn btn-danger btn-sm js-btn-remove">Remove</button>
                            </div>
                        </li>
                    `;

                if (!_isExisting) {
                    $('.js-compatible-software__list').append(_rowHtml).find(".list-group__item").tooltip();
                }
            });

            $('.js-compatible-software__body').removeClass('d-none');
        }
    });

    $(".js-brochure__list").on("click", ".js-btn-remove", function () {
        var _this = $(this);
        var _brochureCard = _this.closest(".js-brochure__card");
        var _brochureBody = _brochureCard.find(".js-brochure__body");
        _this.closest(".list-group__item, .list-group").remove();

        var _items = _brochureBody.find('.list-group__item');
        if (_items.length < 1) {
            _brochureBody.addClass('d-none');
        }
    });

    $('.js-brochure__save').on('click', function () {
        var _brochureName = $("input[name='brochureName']").val();
        if (_brochureName) {
            var _rowHtml = `
              <li class="list-group__item">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-semibold text-gray-900 mb-2">${_brochureName}</span>
                  <button type="button" class="btn btn-danger btn-sm js-btn-remove">Remove</button>
                </div>
              </li>
            `;

            $('.js-brochure__list').append(_rowHtml);
            $('.js-brochure__body').removeClass('d-none');
        }
    });

    $(".js-documents__list").on("click", ".js-btn-remove", function () {
        var _this = $(this);
        var _documentsCard = _this.closest(".js-documents__card");
        var _documentsBody = _documentsCard.find(".js-documents__body");
        _this.closest(".list-group__item, .list-group").remove();

        var _items = _documentsBody.find('.list-group__item');
        if (_items.length < 1) {
            _documentsBody.addClass('d-none');
        }
    });

    $('.js-documents__save').on('click', function () {
        var _documentName = $(".dz-filename span[data-dz-name]").text();
        if (_documentName) {
            var _rowHtml = `
                <li class="list-group__item">
                    <div class="d-flex justify-content-between align-items-center">
                        <a href="#" class="fw-semibold text-gray-900 text-hover-primary mb-2">${_documentName}</a>
                        <button type="button" class="btn btn-danger btn-sm js-btn-remove">Remove</button>
                    </div>
                    <input type="text" name="supportKey" class="form-control mb-2 mt-5"
                           placeholder="Type in page field" value=""/>
                </li>
            `;
            $('.js-documents__list').append(_rowHtml);
            $('.js-documents__body').removeClass('d-none');
        }
    });

    $(".js-awards__list").on("click", ".js-btn-remove", function () {
        var _this = $(this);
        var _awardsCard = _this.closest(".js-awards__card");
        var _awardsBody = _awardsCard.find(".js-awards__body");
        _this.closest(".js-list-group__item").remove();

        var _items = _awardsBody.find('.js-list-group__item');
        if (_items.length < 1) {
            _awardsBody.addClass('d-none');
        }
    });

    $('.js-awards__save').on('click', function () {
        var _srcValue = $(".dz-image img").attr("src");
        if (_srcValue) {
            var _rowHtml = `
               <li class="list-group js-list-group__item mb-4">
                    <div class="dropzone__wrapper gap-7 d-flex justify-content-between align-items-md-start">
                        <div class="dropzone__content">
                            <div class="image-input image-input-outline" data-kt-image-input="true">
                                <div class="image-input-wrapper w-150px h-150px" style="background-image: url(${_srcValue})"></div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-danger btn-sm js-btn-remove">Remove</button>
                    </div>
                </li>
            `;

            $('.js-awards__list').append(_rowHtml);
            $('.js-awards__body').removeClass('d-none');
        }
    });

    $(".js-certificates__list").on("click", ".js-btn-remove", function () {
        var _this = $(this);
        var _consumableCard = _this.closest(".js-certificates__card");
        var _consumableBody = _consumableCard.find(".js-certificates__body");
        _this.closest(".js-list-group__item").remove();

        var _items = _consumableBody.find('.js-list-group__item');
        if (_items.length < 1) {
            _consumableBody.addClass('d-none');
        }
    });

    $('.js-certificates__save').on('click', function () {
        var _srcValue = $(".dz-image img").attr("src");
        if (_srcValue) {
            var _rowHtml = `
               <li class="list-group js-list-group__item mb-4">
                    <div class="dropzone__wrapper gap-7 d-flex justify-content-between align-items-md-start">
                        <div class="dropzone__content">
                            <div class="image-input image-input-outline" data-kt-image-input="true">
                                <div class="image-input-wrapper w-150px h-150px" style="background-image: url(${_srcValue})"></div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-danger btn-sm js-btn-remove">Remove</button>
                    </div>
                </li>
            `;

            $('.js-certificates__list').append(_rowHtml);
            $('.js-certificates__body').removeClass('d-none');
        }
    });

    var _productFrom = $(".js-product__form");
    if (_productFrom.length > 0) {
        _productFrom.on('change', '.js-product__type', function () {
            var _this = $(this);
            var _form = _this.closest(_productFrom);
            var _selectedType = $(this).val().toLowerCase();
            _form.find(".js-product-variant__of");
            _form.find(".js-product__classification");
            _form.find(".js-product__language");
            _form.find(".js-product__availability");
            _form.find(".js-product__discontinued");
            var _quill = new Quill('.summernote');
            if (_selectedType === "variant") {
                _form.find(".js-product-variant__of").removeClass('d-none');
                _form.find(".js-product__classification").prop("disabled", true);
                _form.find(".js-product__language").prop("disabled", true);
                _form.find(".js-product__availability").prop("disabled", true);
                _form.find(".js-product__discontinued").prop("disabled", true);
                _form.find(".js-product-selling__point").prop("disabled", true);
                _form.find(".js-support__keyword").prop("disabled", true);
                _form.find(".js-social-share__desc").prop("disabled", true);
                _form.find(".js-access-permission__filter").prop("disabled", true);
                _form.find(".js-access-permission__multiple").prop("disabled", true);
                _form.find(".js-add-multiple-select").prop("disabled", true);
                _form.find(".js-add-select").prop("disabled", true);
                _form.find(".js-back-select").prop("disabled", true);
                _form.find(".js-back-multiple-select").prop("disabled", true);
                _form.find(".js-remarks").prop("disabled", true);
                _form.find(".js-selling-point__add").addClass('d-none');
                _form.find(".js-consumable__section").addClass('d-none');
                _form.find(".js-full-product__specification").addClass('d-none');
                _form.find(".js-btn-circle").addClass('d-none');
                _form.find(".js-available__on").addClass('d-none');
                _form.find(".js-product__feature").addClass('d-none');
                _form.find(".js-product__tco").addClass('d-none');
                _form.find(".js-product__tpp").addClass('d-none');
                _form.find(".js-tag__tagsify").attr("readonly", "readonly");
                _quill.disable();
            } else if (_selectedType === "bundle") {
                _form.find(".js-variant__category").addClass('d-none');
                _form.find(".js-bundle").removeClass('d-none');
                _form.find(".js-selling-point").addClass('d-none');
                _form.find(".js-product-variant__of").addClass('d-none');
                _form.find(".js-product__classification").prop("disabled", false);
                _form.find(".js-product__language").prop("disabled", false);
                _form.find(".js-product__availability").prop("disabled", false);
                _form.find(".js-product__discontinued").prop("disabled", false);
                _form.find(".js-product-selling__point").prop("disabled", false);
                _form.find(".js-support__keyword").prop("disabled", true);
                _form.find(".js-social-share__desc").prop("disabled", true);
                _form.find(".js-access-permission__filter").prop("disabled", false);
                _form.find(".js-access-permission__multiple").prop("disabled", false);
                _form.find(".js-add-multiple-select").prop("disabled", false);
                _form.find(".js-add-select").prop("disabled", false);
                _form.find(".js-back-select").prop("disabled", false);
                _form.find(".js-back-multiple-select").prop("disabled", false);
                _form.find(".js-remarks").prop("disabled", false);
                _form.find(".js-selling-point__add").addClass('d-none');
                _form.find(".js-consumable__section").addClass('d-none');
                _form.find(".js-full-product__specification").addClass('d-none');
                _form.find(".js-btn-circle").addClass('d-none');
                _form.find(".js-available__on").addClass('d-none');
                _form.find(".js-product__feature").addClass('d-none');
                _form.find(".js-product__tco").addClass('d-none');
                _form.find(".js-product__tpp").addClass('d-none');
                _form.find(".js-tag__tagsify").removeAttr("readonly", "readonly");
                _quill.disable();
            } else {
                _form.find(".js-product-variant__of").addClass('d-none');
                _form.find(".js-product__classification").prop("disabled", false);
                _form.find(".js-product__language").prop("disabled", false);
                _form.find(".js-product__availability").prop("disabled", false);
                _form.find(".js-product__discontinued").prop("disabled", false);
                _form.find(".js-product-selling__point").prop("disabled", false);
                _form.find(".js-support__keyword").prop("disabled", false);
                _form.find(".js-social-share__desc").prop("disabled", false);
                _form.find(".js-access-permission__filter").prop("disabled", false);
                _form.find(".js-access-permission__multiple").prop("disabled", false);
                _form.find(".js-add-multiple-select").prop("disabled", false);
                _form.find(".js-add-select").prop("disabled", false);
                _form.find(".js-back-select").prop("disabled", false);
                _form.find(".js-back-multiple-select").prop("disabled", false);
                _form.find(".js-remarks").prop("disabled", false);
                _form.find(".js-selling-point__add").removeClass('d-none');
                _form.find(".js-consumable__section").removeClass('d-none');
                _form.find(".js-full-product__specification").removeClass('d-none');
                _form.find(".js-btn-circle").removeClass('d-none');
                _form.find(".js-available__on").removeClass('d-none');
                _form.find(".js-product__feature").removeClass('d-none');
                _form.find(".js-product__tco").removeClass('d-none');
                _form.find(".js-product__tpp").removeClass('d-none');
                _form.find(".js-tag__tagsify").attr("readonly", "readonly");
                _form.find(".js-variant__category").removeClass('d-none');
                _form.find(".js-bundle").addClass('d-none');
                _form.find(".js-selling-point").removeClass('d-none');
                _quill.disable();
            }
        });

        _productFrom.on('change', '.js-checkbox__user-access', function () {
            var _this = $(this);
            var _form = _this.closest(_productFrom);
            var $isChecked = _this.is(':checked');

            if ($isChecked) {
                _form.find('.js-product__preview-password').removeClass('d-none');
            } else {
                _form.find('.js-product__preview-password').addClass('d-none');
            }
        });
    }

    var _bundle = $(".js-bundle");
    if (_bundle.length > 0) {
        _bundle.on('click', '.js-bundle__add', function () {
            var _this = $(this);
            var _bundleList = _this.closest('.js-bundle');
            var _bundleItem = _bundleList.find('.js-bundle__list');
            var totalIndex = $(".js-bundle__item").map(function () {
                return $(this).data('order');
            }).get();
            var _index = totalIndex ? Math.max.apply(Math, totalIndex) + 1 : _bundleItem.find('.js-bundle__item').length;
            var _rowHtml = `
                <li class="list-group-item js-bundle__item border-0"
                    data-order="${_index}">
                    <div class="row">
                        <div class="col-md-2">
                            <div class="form-check form-check-custom form-check-solid">
                                <input class="form-check-input" type="radio" value="" id="flexRadioDefault"/>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" data-control="select2" data-hide-search="false" data-allow-clear="true"
                                    data-placeholder="Select product">
                                <option></option>
                                <option value="1">EOS R1</option>
                                <option value="2">EOS R2</option>
                                <option value="3">EOS R3</option>
                                <option value="4">EOS R4</option>
                                <option value="5">EOS R5</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" data-control="select2" data-hide-search="false" data-allow-clear="true"
                                    data-placeholder="Select variant">
                                <option></option>
                                <option value="1">Black-body</option>
                                <option value="2">Rilakkuma-kit</option>
                                <option value="3">Silver-body</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <input type="number" name="quantity" class="form-control" placeholder="" value=""/>
                        </div>

                        <div class="col-md-1">
                            <div class="mt-1">
                                <a href="javascript:;" class="text-hover-success btn-add mt-1 js-bundle__add">
                                <span class="svg-icon svg-icon-3x">
                                    <svg width="34" height="34" viewBox="0 0 34 34"
                                         fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.25" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                              fill="currentColor" />
                                        <path fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M17.0003 24.0833C17.7827 24.0833 18.417 23.4491 18.417 22.6667V18.4167H22.667C23.4494 18.4167 24.0837 17.7824 24.0837 17C24.0837 16.2176 23.4494 15.5833 22.667 15.5833H18.417V11.3333C18.417 10.5509 17.7827 9.91666 17.0003 9.91666C16.2179 9.91666 15.5837 10.5509 15.5837 11.3333V15.5833H11.3337C10.5513 15.5833 9.91699 16.2176 9.91699 17C9.91699 17.7824 10.5513 18.4167 11.3337 18.4167H15.5837V22.6667C15.5837 23.4491 16.2179 24.0833 17.0003 24.0833Z"
                                              fill="currentColor" />
                                    </svg>
                                </span>
                                </a>
                                <a href="javascript:;" class="text-hover-danger btn-remove mt-1 js-bundle__remove d-none">
                                <span class="svg-icon svg-icon-3x">
                                    <svg width="34" height="34" viewBox="0 0 34 34"
                                         fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.25" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                              fill="currentColor" />
                                        <path
                                                d="M12.75 14.1667V22.5834C12.75 23.4118 13.4216 24.0834 14.25 24.0834H19.75C20.5784 24.0834 21.25 23.4118 21.25 22.5834V14.1667H12.75Z"
                                                fill="currentColor" />
                                        <path opacity="0.3" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M18.417 11.6875V11.625C18.417 11.0727 17.9693 10.625 17.417 10.625H16.5837C16.0314 10.625 15.5837 11.0727 15.5837 11.625V11.6875H12.542C12.2659 11.6875 12.042 11.9114 12.042 12.1875V12.25C12.042 12.5261 12.2658 12.75 12.542 12.75H21.4587C21.7348 12.75 21.9587 12.5261 21.9587 12.25V12.1875C21.9587 11.9114 21.7348 11.6875 21.4587 11.6875H18.417Z"
                                              fill="currentColor" />
                                    </svg>
                                </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </li>
            `;

            $('.btn-add').addClass('d-none');
            $('.btn-remove').removeClass('d-none');
            _bundleItem.append(_rowHtml);
            $('[data-control="select2"]').select2();
        });

        _bundle.on('click', '.js-bundle__remove', function () {
            $(this).closest('.js-bundle__item').remove();
        });
    }

    var _variantCategory = $(".js-variant__category");
    if (_variantCategory.length > 0) {
        _variantCategory.on('click', '.js-variant-category__add', function () {
            var _this = $(this);
            var _variantCategoryList = _this.closest(_variantCategory);
            var _variantCategoryItem = _variantCategoryList.find('.js-variant__category-list');
            var totalIndex = $('.js-variant__category-item').map(function () {
                return $(this).data('order');
            }).get();
            var _index = totalIndex ? Math.max.apply(Math, totalIndex) + 1 : _variantCategoryItem.find('.js-variant__category-item').length;
            var _rowHtml = `
        <li class="list-group-item js-variant__category-item border-0"
            data-order="${_index}">
            <div class="row">
                <div class="col-md-4">
                    <select class="form-select" data-kt-repeater="select2" data-hide-search="false" data-allow-clear="true"
                            data-placeholder="SKU type">
                        <option></option>
                        <option value="0">r1-black</option>
                        <option value="1">r2-black</option>
                        <option value="2">r6-black-hershey</option>
                        <option value="3">r6-rl-black</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <input type="text" name="sku" class="form-control" placeholder="Regional SKU" value=""/>
                </div>

                <div class="col-md-2 w-175px mt-3 js-manage__local d-none">
                    <a href="#" class="form-label text-hover-primary" data-bs-toggle="modal" data-bs-target="#modal-manage-subvariant">Local SKU overwrite</a>
                </div>
                <div class="col-md-1">
                    <a href="javascript:;" class="text-hover-success btn-add mt-1 js-variant-category__add">
                        <span class="svg-icon svg-icon-3x">
                            <svg width="34" height="34" viewBox="0 0 34 34"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.25" fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                      fill="currentColor" />
                                <path fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M17.0003 24.0833C17.7827 24.0833 18.417 23.4491 18.417 22.6667V18.4167H22.667C23.4494 18.4167 24.0837 17.7824 24.0837 17C24.0837 16.2176 23.4494 15.5833 22.667 15.5833H18.417V11.3333C18.417 10.5509 17.7827 9.91666 17.0003 9.91666C16.2179 9.91666 15.5837 10.5509 15.5837 11.3333V15.5833H11.3337C10.5513 15.5833 9.91699 16.2176 9.91699 17C9.91699 17.7824 10.5513 18.4167 11.3337 18.4167H15.5837V22.6667C15.5837 23.4491 16.2179 24.0833 17.0003 24.0833Z"
                                      fill="currentColor" />
                            </svg>
                        </span>
                    </a>
                    <a href="javascript:;" class="text-hover-danger btn-remove mt-1 js-variant-category__remove d-none">
                        <span class="svg-icon svg-icon-3x">
                            <svg width="34" height="34" viewBox="0 0 34 34"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.25" fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                      fill="currentColor" />
                                <path
                                        d="M12.75 14.1667V22.5834C12.75 23.4118 13.4216 24.0834 14.25 24.0834H19.75C20.5784 24.0834 21.25 23.4118 21.25 22.5834V14.1667H12.75Z"
                                        fill="currentColor" />
                                <path opacity="0.3" fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M18.417 11.6875V11.625C18.417 11.0727 17.9693 10.625 17.417 10.625H16.5837C16.0314 10.625 15.5837 11.0727 15.5837 11.625V11.6875H12.542C12.2659 11.6875 12.042 11.9114 12.042 12.1875V12.25C12.042 12.5261 12.2658 12.75 12.542 12.75H21.4587C21.7348 12.75 21.9587 12.5261 21.9587 12.25V12.1875C21.9587 11.9114 21.7348 11.6875 21.4587 11.6875H18.417Z"
                                      fill="currentColor" />
                            </svg>
                        </span>
                    </a>
                </div>
            </div>
        </li>
     `;
            _variantCategory.find('.btn-add').addClass('d-none');
            _variantCategory.find('.btn-remove').removeClass('d-none');
            _variantCategory.find('.js-manage__local').removeClass('d-none');
            _variantCategoryItem.append(_rowHtml);
            $('[data-kt-repeater="select2"]').select2();
        });

        _variantCategory.on('click', '.js-variant-category__remove', function () {
            $(this).closest('.js-variant__category-item').remove();
        });
    }

    var _variantCategoryModal = $(".js-variant-category__modal");
    if (_variantCategoryModal.length > 0) {
        _variantCategoryModal.on('click', '.js-variant-category__modal-add', function () {
            var _this = $(this);
            var _variantCategoryModalList = _this.closest(_variantCategoryModal);
            var _variantCategoryModalItem = _variantCategoryModalList.find('.js-variant-category__modal-list');
            var totalIndex = $('.js-variant-category__modal-item').map(function () {
                return $(this).data('order');
            }).get();
            var _index = totalIndex ? Math.max.apply(Math, totalIndex) + 1 : _variantCategoryModalItem.find('.js-variant-category__modal-item').length;
            var _rowHtml = `
            <li class="list-group-item js-variant-category__modal-item border-0"
                data-order="${_index}">
                <div class="row">
                    <div class="col-md-5">
                        <select class="form-select" data-kt-repeater="select2" data-hide-search="false" data-allow-clear="true"
                                data-placeholder="Select site">
                            <option></option>
                            <option value="1">Singapore</option>
                            <option value="3">India</option>
                            <option value="4">Taiwan</option>
                            <option value="5">Indonesia</option>
                            <option value="6">Malaysia</option>
                            <option value="7">Vietnam</option>
                            <option value="8">Philippines</option>
                            <option value="9">Hong Kong</option>
                            <option value="10">China</option>
                        </select>
                    </div>
    
                    <div class="col-md-5">
                        <input type="text" name="sku" class="form-control" placeholder="" value=""/>
                    </div>
    
                    <div class="col-md-1">
                        <a href="javascript:;" class="text-hover-success btn-add__modal mt-1 js-variant-category__modal-add">
                            <span class="svg-icon svg-icon-3x">
                                <svg width="34" height="34" viewBox="0 0 34 34"
                                     fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path opacity="0.25" fill-rule="evenodd"
                                          clip-rule="evenodd"
                                          d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                          fill="currentColor" />
                                    <path fill-rule="evenodd"
                                          clip-rule="evenodd"
                                          d="M17.0003 24.0833C17.7827 24.0833 18.417 23.4491 18.417 22.6667V18.4167H22.667C23.4494 18.4167 24.0837 17.7824 24.0837 17C24.0837 16.2176 23.4494 15.5833 22.667 15.5833H18.417V11.3333C18.417 10.5509 17.7827 9.91666 17.0003 9.91666C16.2179 9.91666 15.5837 10.5509 15.5837 11.3333V15.5833H11.3337C10.5513 15.5833 9.91699 16.2176 9.91699 17C9.91699 17.7824 10.5513 18.4167 11.3337 18.4167H15.5837V22.6667C15.5837 23.4491 16.2179 24.0833 17.0003 24.0833Z"
                                          fill="currentColor" />
                                </svg>
                            </span>
                        </a>
                        <a href="javascript:;" class="text-hover-danger btn-remove__modal mt-1 js-variant-category__modal-remove d-none">
                             <span class="svg-icon svg-icon-3x">
                                <svg width="34" height="34" viewBox="0 0 34 34"
                                     fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path opacity="0.25" fill-rule="evenodd"
                                          clip-rule="evenodd"
                                          d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                          fill="currentColor" />
                                    <path
                                            d="M12.75 14.1667V22.5834C12.75 23.4118 13.4216 24.0834 14.25 24.0834H19.75C20.5784 24.0834 21.25 23.4118 21.25 22.5834V14.1667H12.75Z"
                                            fill="currentColor" />
                                    <path opacity="0.3" fill-rule="evenodd"
                                          clip-rule="evenodd"
                                          d="M18.417 11.6875V11.625C18.417 11.0727 17.9693 10.625 17.417 10.625H16.5837C16.0314 10.625 15.5837 11.0727 15.5837 11.625V11.6875H12.542C12.2659 11.6875 12.042 11.9114 12.042 12.1875V12.25C12.042 12.5261 12.2658 12.75 12.542 12.75H21.4587C21.7348 12.75 21.9587 12.5261 21.9587 12.25V12.1875C21.9587 11.9114 21.7348 11.6875 21.4587 11.6875H18.417Z"
                                          fill="currentColor" />
                                </svg>
                            </span>
                        </a>
                    </div>
                </div>
            </li>

     `;
            _variantCategoryModal.find('.btn-add__modal').addClass('d-none');
            _variantCategoryModal.find('.btn-remove__modal').removeClass('d-none');
            _variantCategoryModalItem.append(_rowHtml);
            $('[data-kt-repeater="select2"]').select2();
        });

        _variantCategoryModal.on('click', '.js-variant-category__modal-remove', function () {
            $(this).closest('.js-variant-category__modal-item').remove();
        });
    }

    var _specificationModal = $('#modal-full-specification');
    if (_specificationModal.length > 0) {
        _specificationModal.on('click', '.js-product-specification__remove', function () {
            var _accordionContent = $(this).closest('.js-accordion-content');
            _accordionContent.find('.js-product-specification__input').val('');
        });
    }
});
$(function () {
    function handleInputChange(inputSelector) {
        $(inputSelector).on({
            keydown: function (e) {
                var key = e.which || e.keyCode;
                if (!(key >= 48 && key <= 57 || key === 188 || key === 190 || key === 8 || key === 46)) {
                    e.preventDefault();
                }
            },
            input: function () {
                var _oldDataType = $(this).attr("value");
                var _newDataType = $(this).val();
                var _currentRow = $(this).closest('tr');
                var _submitButton = _currentRow.find('.js-btn-submit');

                if (_oldDataType !== _newDataType) {
                    _submitButton.removeClass('d-none');
                } else {
                    _submitButton.addClass('d-none');
                }
            }
        });
    }

    var _tabProductPrice = $('#tab-product-price');
    if (_tabProductPrice.length > 0) {
        var currentURL = window.location.href;
        var currentPath = currentURL.substring(0, currentURL.lastIndexOf("/"));

        function handleSelectPriceTypeChange(e) {
            var _this = $(e.target);
            var _selectedType = _this.val().toLowerCase();
            var _dataUrl = _this.find(":selected").data('url');
            if (_selectedType === 'vip' || _selectedType === 'member' || _selectedType === 'student') {
                window.location.href = _dataUrl ? currentPath + "/" + _dataUrl : currentPath;
            } else {
                window.location.href = _dataUrl ? currentPath + "/" + _dataUrl : currentPath;
            }
        }

        _tabProductPrice.on('change', '.js-select-price-type__location', function (e) {
            e.preventDefault();
            handleSelectPriceTypeChange(e);
        });

        _tabProductPrice.on('change', '.js-select-price-type__channel', function (e) {
            e.preventDefault();
            handleSelectPriceTypeChange(e);
        });

        _tabProductPrice.on('change', '.js-select-category', function (e) {
            e.preventDefault();
            handleSelectPriceTypeChange(e);
        });
    }

    handleInputChange("input[data-type='price']");
    handleInputChange("input[data-type='stock']");
});
$(function () {
   function handlePromotionTypes(promotionType) {
      var _promoCatalog = $('.js-section-promo__type-catalog');
      var _promoCart = $('.js-section-promo__type-cart');
      var _promoProductList = $('.js-section-promo__product-list');
      var _sectionPromoType = _formPromotion.find('.js-section-promo__type');
      var _promoTypeLabel = $('.js-promo-type-label');
      var _promoProductLabel = _promoTypeLabel.data("promo-product-label");
      var _promoCartLabel = _promoTypeLabel.data("promo-cart-label");

      _sectionPromoType.removeClass('d-none');
      if (promotionType === 'Catalog') {
         _promoCatalog.show();
         _promoProductList.show();
         _promoCart.hide();
         _promoTypeLabel.text(_promoProductLabel);
      } else if (promotionType === 'Cart') {
         _promoCatalog.hide();
         _promoProductList.hide();
         _promoCart.show();
         _promoTypeLabel.text(_promoCartLabel);
      } else {
         _promoCatalog.hide();
         _promoCart.hide();
         _promoProductList.hide();
         _sectionPromoType.addClass('d-none');
      }
   }

   function handlePromotionTypeChange(promotionType) {
      var _promoSimple = $('.js-promo-simple');
      var _promoComplex = $('.js-promo-complex');
      var _sectionPromoType = _formPromotion.find('.js-section-promo-type');
      var _promoTypeLabel = $('.js-promo-type-label');
      var _promoProductLabel = _promoTypeLabel.data("promo-product-label");
      var _promoCartLabel = _promoTypeLabel.data("promo-cart-label");

      _sectionPromoType.removeClass('d-none');
      if (promotionType === 'Simple') {
         _promoSimple.show();
         _promoComplex.hide();
         _promoTypeLabel.text(_promoProductLabel);
      } else if (promotionType === 'Complex') {
         _promoSimple.hide();
         _promoComplex.show();
         _promoTypeLabel.text(_promoCartLabel);
      } else {
         _promoSimple.hide();
         _promoComplex.hide();
         _sectionPromoType.addClass('d-none');
      }
   }

   var _promoComplex = $(".js-promo-complex, .js-section-promo__type-cart");
   if (_promoComplex.length > 0) {
      _promoComplex.on('click', '.js-promo-complex__add', function () {
         var _this = $(this);
         var _promoComplexList = _this.closest(_promoComplex);
         var _promoComplexItem = _promoComplexList.find('.js-promo-complex__list');
         var totalIndex = $('.js-promo-complex__item').map(function () {
            return $(this).data('order');
         }).get();
         var _index = totalIndex ? Math.max.apply(Math, totalIndex) + 1 : _promoComplexItem.find('.js-variant__category-item').length;
         var _rowHtml = `
              <li class="list-group-item js-promo-complex__item border-0"
                  data-order="${_index}">
                  <div class="row">
                      <div class="col-md-3">
                          <select class="form-select js-select__condition" data-control="select2" data-hide-search="true" data-allow-clear="true"
                                  data-placeholder="Select condition">
                              <option></option>
                              <option value="0">Product</option>
                              <option value="1">Subtotal</option>
                              <option value="limit_specific_email">Limit to specific email(s)</option>
                          </select>
                      </div>
                      <div class="col-md-3">
                          <select class="form-select" data-control="select2" data-hide-search="true" data-allow-clear="true"
                                  data-placeholder="Equals">
                              <option></option>
                              <option value="0">Equals</option>
                              <option value="1">Equals</option>
                          </select>
                      </div>
                      <div class="col-md-3 js-promotion__products">
                          <select class="form-select" data-control="select2" data-hide-search="true" data-allow-clear="true"
                                  data-placeholder="EOS R5">
                              <option></option>
                              <option value="0">EOS R1</option>
                              <option value="1">EOS R2</option>
                          </select>
                      </div>
                      <div class="col-md-3 js-promotion__limit-email d-none">
                          <input class="form-control tagsify" placeholder="Email(s)" value="">
                      </div>
      
                      <div class="col-md-1">
                          <a href="javascript:;" class="text-hover-success btn-add mt-1 js-promo-complex__add">
                              <span class="svg-icon svg-icon-3x">
                                  <svg width="34" height="34" viewBox="0 0 34 34"
                                       fill="none"
                                       xmlns="http://www.w3.org/2000/svg">
                                      <path opacity="0.25" fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                            fill="currentColor" />
                                      <path fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M17.0003 24.0833C17.7827 24.0833 18.417 23.4491 18.417 22.6667V18.4167H22.667C23.4494 18.4167 24.0837 17.7824 24.0837 17C24.0837 16.2176 23.4494 15.5833 22.667 15.5833H18.417V11.3333C18.417 10.5509 17.7827 9.91666 17.0003 9.91666C16.2179 9.91666 15.5837 10.5509 15.5837 11.3333V15.5833H11.3337C10.5513 15.5833 9.91699 16.2176 9.91699 17C9.91699 17.7824 10.5513 18.4167 11.3337 18.4167H15.5837V22.6667C15.5837 23.4491 16.2179 24.0833 17.0003 24.0833Z"
                                            fill="currentColor" />
                                  </svg>
                              </span>
                          </a>
                          <a href="javascript:;" class="text-hover-danger btn-remove mt-1 js-promo-complex__remove d-none">
                               <span class="svg-icon svg-icon-3x">
                                  <svg width="34" height="34" viewBox="0 0 34 34"
                                       fill="none"
                                       xmlns="http://www.w3.org/2000/svg">
                                      <path opacity="0.25" fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                            fill="currentColor" />
                                      <path
                                              d="M12.75 14.1667V22.5834C12.75 23.4118 13.4216 24.0834 14.25 24.0834H19.75C20.5784 24.0834 21.25 23.4118 21.25 22.5834V14.1667H12.75Z"
                                              fill="currentColor" />
                                      <path opacity="0.3" fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M18.417 11.6875V11.625C18.417 11.0727 17.9693 10.625 17.417 10.625H16.5837C16.0314 10.625 15.5837 11.0727 15.5837 11.625V11.6875H12.542C12.2659 11.6875 12.042 11.9114 12.042 12.1875V12.25C12.042 12.5261 12.2658 12.75 12.542 12.75H21.4587C21.7348 12.75 21.9587 12.5261 21.9587 12.25V12.1875C21.9587 11.9114 21.7348 11.6875 21.4587 11.6875H18.417Z"
                                            fill="currentColor" />
                                  </svg>
                              </span>
                          </a>
                      </div>
                  </div>
              </li>
           `;
         _promoComplex.find('.btn-add').addClass('d-none');
         _promoComplex.find('.btn-remove').removeClass('d-none');
         _promoComplexItem.append(_rowHtml);
         $('[data-control="select2"]').select2();
         var newTagifyElement = $('.tagsify').last().get(0);
         new Tagify(newTagifyElement);
      });

      _promoComplex.on('click', '.js-promo-complex__remove', function () {
         $(this).closest('.js-promo-complex__item').remove();
      });
   }

   var _formPromotion = $('.js-form-promotion');
   if (_formPromotion.length > 0) {
      var _selectedPromotionType = $('.js-promo-type').find('option:selected').attr('value');
      if (_selectedPromotionType) {
         handlePromotionTypeChange(_selectedPromotionType);
      }

      _formPromotion.on('change', '.js-promo-type', function () {
         var _selectedType = $(this).val();
         handlePromotionTypeChange(_selectedType);
      });

      if (_selectedPromotionType) {
         handlePromotionTypes(_selectedPromotionType);
      }

      _formPromotion.on('change', '.js-promo-type', function () {
         var _selectedType = $(this).val();
         handlePromotionTypes(_selectedType);
      });

      _formPromotion.on('click', '.js-product-list__remove', function () {
         $(this).closest('.js-promo__product-item').remove();
      });

      $('.js-checkbox-promotion__price').on('change', function () {
         var _this = $(this);
         var _modalBody = _this.closest('.js-modal__body');
         var $isChecked = _this.is(':checked');

         if ($isChecked) {
            _modalBody.find('.js-input-promotion__price').prop("disabled", false);
         } else {
            _modalBody.find('.js-input-promotion__price').prop("disabled", true);
         }
      });

      $('.js-checkbox-add-promotion__image').on('change', function () {
         var _this = $(this);
         var _modalBody = _this.closest('.js-modal__body');
         var $isChecked = _this.is(':checked');

         if ($isChecked) {
            _modalBody.find('.js-add-promotion__image').removeClass('d-none');
         } else {
            _modalBody.find('.js-add-promotion__image').addClass('d-none');
         }
      });

      $('.js-promotion__action').on('change', function () {
         var _this = $(this);
         var _selectedAction = _this.val();
         var _modalBody = _this.closest('.js-modal__body');

         if (_selectedAction === 'product') {
            _modalBody.find('.js-promotion__action-product').removeClass('d-none');
            _modalBody.find('.js-promotion__action-value').addClass('d-none');
         } else {
            _modalBody.find('.js-promotion__action-product').addClass('d-none');
            _modalBody.find('.js-promotion__action-value').removeClass('d-none');
         }
      });

      _formPromotion.on('change', '.js-promotion__percent-off', function () {
         var _this = $(this);
         var _selectedAction = _this.val();
         if (_selectedAction === 'percent_off') {
            _formPromotion.find('.js-promo-max-discount__amount').removeClass('d-none');
         } else {
            _formPromotion.find('.js-promo-max-discount__amount').addClass('d-none');
         }
      });

      _formPromotion.on('change', '.js-stackable__info', function () {
         var _this = $(this);
         var _stackableInfo = _this.data('stackable-info');
         var _isChecked = _this.prop('checked');
         if (_isChecked) {
            Swal.fire({
               html: _stackableInfo,
               icon: 'warning',
               buttonsStyling: false,
               showCancelButton: true,
               confirmButtonText: 'Yes',
               cancelButtonText: 'Cancel',
               customClass: {
                  confirmButton: 'btn btn-primary',
                  cancelButton: 'btn btn-danger'
               }
            }).then(result => {
               if (result.isConfirmed) {
                  _this.prop('checked', true);
               } else {
                  _this.prop('checked', false);
               }
            });
         } else {
            Swal.close();
         }
      });

      _formPromotion.on('change', '.js-promo__checked-limit-email', function () {
         var _this = $(this);
         var _isChecked = _this.prop('checked');
         if (_isChecked) {
            _formPromotion.find('.js-promo__limit-email').prop('disabled', false);
         } else {
            _formPromotion.find('.js-promo__limit-email').prop('disabled', true);
         }
      });

      _formPromotion.on('change', '.js-select__condition', function () {
         var _this = $(this);
         var _selectedConditionItem = _this.closest(".js-promo-complex__item");
         var _selectedCondition = _this.val();
         if (_selectedCondition === 'limit_specific_email') {
            _selectedConditionItem.find('.js-promotion__limit-email').removeClass('d-none');
            _selectedConditionItem.find('.js-promotion__products').addClass('d-none');
         } else {
            _selectedConditionItem.find('.js-promotion__limit-email').addClass('d-none');
            _selectedConditionItem.find('.js-promotion__products').removeClass('d-none');
         }
      });

      var _productFreeGift = $('.js-product-free-gift');
      if (_productFreeGift.length > 0) {
         _productFreeGift.on('click', '.js-product-free-gift__add', function () {
            var _this = $(this);
            var _productFreeGift = _this.closest('.js-product-free-gift');
            var _productFreeGiftList = _productFreeGift.find('.js-product-free-gift__list');
            var totalIndex = $(".js-product-free-gift__item").map(function () {
               return $(this).data('order');
            }).get();
            var _index = totalIndex ? Math.max.apply(Math, totalIndex) + 1 : _productFreeGiftList.find('.js-product-free-gift__item').length;
            var _rowHtml = `
                    <li class="list-group-item js-product-free-gift__item border-0" data-order="${_index}">
                    <div class="row">
                        <div class="col-md-5">
                        
                            <select class="form-select js-promo-product__select2" data-control="select2" data-hide-search="true" data-allow-clear="true"
                                    data-placeholder="Select product">
                                <option></option>
                                <option value="0">EOS R1 | Black-body (r1-black)</option>
                                <option value="1">EOS R2 | Default (r2-black)</option>
                                <option value="2">EOS R3 | Default (r3-black)</option>
                                <option value="3">EOS R4 | Silver-Body (r4-silver)</option>
                                <option value="4">EOS R5 | Black-body (r5-black)</option>
                            </select>
                        </div>
                        <div class="col-md-5">
                            <input type="number" name="qty" class="form-control" placeholder="Qty" value=""/>
                        </div>
                        <div class="col-md-2">
                            <a href="javascript:;" class="text-hover-success btn-add mt-1 js-product-free-gift__add">
                                <span class="svg-icon svg-icon-3x">
                                    <svg width="34" height="34" viewBox="0 0 34 34"
                                         fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.25" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                              fill="currentColor" />
                                        <path fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M17.0003 24.0833C17.7827 24.0833 18.417 23.4491 18.417 22.6667V18.4167H22.667C23.4494 18.4167 24.0837 17.7824 24.0837 17C24.0837 16.2176 23.4494 15.5833 22.667 15.5833H18.417V11.3333C18.417 10.5509 17.7827 9.91666 17.0003 9.91666C16.2179 9.91666 15.5837 10.5509 15.5837 11.3333V15.5833H11.3337C10.5513 15.5833 9.91699 16.2176 9.91699 17C9.91699 17.7824 10.5513 18.4167 11.3337 18.4167H15.5837V22.6667C15.5837 23.4491 16.2179 24.0833 17.0003 24.0833Z"
                                              fill="currentColor" />
                                    </svg>
                                </span>
                            </a>
                            <a href="javascript:;" class="text-hover-danger btn-remove mt-1 js-product-free-gift__remove d-none">
                                <span class="svg-icon svg-icon-3x">
                                    <svg width="34" height="34" viewBox="0 0 34 34"
                                         fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.25" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M9.26728 3.35608C6.15515 3.7671 3.76677 6.15549 3.35575 9.26762C3.07318 11.4071 2.83301 14.0835 2.83301 17C2.83301 19.9165 3.07318 22.5929 3.35575 24.7324C3.76677 27.8445 6.15515 30.2329 9.26728 30.6439C11.4068 30.9265 14.0831 31.1667 16.9997 31.1667C19.9162 31.1667 22.5926 30.9265 24.7321 30.6439C27.8442 30.2329 30.2326 27.8445 30.6436 24.7324C30.9262 22.5929 31.1663 19.9165 31.1663 17C31.1663 14.0835 30.9262 11.4071 30.6436 9.26762C30.2326 6.15549 27.8442 3.7671 24.7321 3.35608C22.5926 3.07352 19.9162 2.83334 16.9997 2.83334C14.0831 2.83334 11.4068 3.07352 9.26728 3.35608Z"
                                              fill="currentColor" />
                                        <path
                                                d="M12.75 14.1667V22.5834C12.75 23.4118 13.4216 24.0834 14.25 24.0834H19.75C20.5784 24.0834 21.25 23.4118 21.25 22.5834V14.1667H12.75Z"
                                                fill="currentColor" />
                                        <path opacity="0.3" fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M18.417 11.6875V11.625C18.417 11.0727 17.9693 10.625 17.417 10.625H16.5837C16.0314 10.625 15.5837 11.0727 15.5837 11.625V11.6875H12.542C12.2659 11.6875 12.042 11.9114 12.042 12.1875V12.25C12.042 12.5261 12.2658 12.75 12.542 12.75H21.4587C21.7348 12.75 21.9587 12.5261 21.9587 12.25V12.1875C21.9587 11.9114 21.7348 11.6875 21.4587 11.6875H18.417Z"
                                              fill="currentColor" />
                                    </svg>
                                </span>
                            </a>
                        </div>
                    </div>
                </li>`;

            $('.btn-add').addClass('d-none');
            $('.btn-remove').removeClass('d-none');

            _productFreeGiftList.append(_rowHtml);
            _productFreeGiftList.find('[data-control="select2"]').select2({ dropdownParent: $('.js-modal__body') });
         });

         _productFreeGift.on('click', '.js-product-free-gift__remove', function () {
            $(this).closest('.js-product-free-gift__item').remove();
         });

         $('#modal-add-promotion-product').on('shown.bs.modal', function () {
            $('.js-promo-product__select2').select2({
               dropdownParent: $('.js-modal__body')
            });
         });
      }
   }
});
// Reset Password Form
const resetPasswordModal = $('#modal-reset-password');
resetPasswordModal.on('show.bs.modal', function (e) {
    const $this = $(this);
    let $dataId = $(e.relatedTarget).data('id');
    let $dataEmail = $(e.relatedTarget).data('email');

    $this.find('[name="id"]').val($dataId);
    $this.find('[name="email"]').val($dataEmail);
});

const resetPasswordForm = resetPasswordModal.find('form');
resetPasswordForm.validate({
    rules: {
        newPassword: {
            required: true,
            passwordFormat: true
        },
        confirmPassword: {
            required: true,
            equalTo: "#newPassword"

        }
    },
    messages: {
        newPassword: {
            required: "Please enter a new password."
        },
        confirmPassword: {
            required: "Please confirm your new password.",
            equalTo: "Passwords do not match."
        }
    },
    submitHandler: function (_form) {
        console.log(_form);
        // if (_form.valid()) {
        //     _form.submit();
        //     modalResetPassword.hide();
        // }
    }
});
// End Reset Password Form

// Change Password Form
const changePasswordModal = $('#modal-change-password');
const changePasswordForm = changePasswordModal.find('form');
changePasswordForm.validate({
    rules: {
        currentPassword: {
            required: true
        },
        newPass: {
            required: true,
            passwordFormat: true
        },
        confirmPass: {
            required: true,
            equalTo: "#newPass"
        }
    },
    messages: {
        currentPassword: {
            required: "Please enter current password."
        },
        newPass: {
            required: "Please enter a new password."
        },
        confirmPass: {
            required: "Please confirm your new password.",
            equalTo: "Passwords do not match."
        }
    },
    submitHandler: function (_form) {
        if (_form.valid()) {
            _form.submit();
            $("#myModal").hide();
        }
    }
});
// End Change Password Form
$(function () {
    $('#sign-validate').validate({
        rules: {
            username: {
                required: true
            },
            password: {
                required: true,
                minlength: 5
            }
        },
        messages: {
            username: "Please enter your username",
            password: {
                required: "Please provide a password",
                minlength: "Your password must be at least 5 characters long"
            }
        }
    });
});