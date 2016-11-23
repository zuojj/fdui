(function(window) {

    require('./slider.css');

    var $ = require('jquery');

    function Slider(options) {
        var me = this,
            noop = function() {};

        options = options || {};

        if (!(me instanceof Slider)) {
            return new Slider(options);
        }
        /**
         * @property {Selector}      container Slider外部容器
         * @property {Number}        interval  动画间隔，默认2000，单位ms
         * @property {Number}        duration  动画速度，默认600，单位ms
         * @property {Boolean}       autoplay  自动播放，默认true
         * @property {Number}        current   当前索引，默认0
         * @property {Number|String} width     容器宽度，默认'auto'
         * @property {Number|String} height    容器高度，默认'auto'
         * @property {String}        direction 轮播方向，[RTL,LTR]，默认'RTL'
         * @property {Boolean}       dots      是否显示圆点，默认true
         * @property {Boolean}       buttons   是否显示按钮，默认true
         * @property {Number}        zIndex    Item Z轴层级，默认1
         */
        me.defaults = {
            container: '',
            interval: 5000,
            duration: 600,
            autoplay: true,
            current: 0,
            width: '',
            height: '',
            direction: 'RTL',
            dots: true,
            buttons: true,
            zIndex: 1
        };

        me.options = $.extend(true, {}, me.defaults, options);
        me.init();
    }

    Slider.prototype = {
        /**
         * [init 初始化]
         * @return {[type]} [description]
         */
    	init: function() {
    		var me = this,
                opts = me.options,
                $container = $(opts.container);

            if(!$container.length) return;

            me.$slider = $container.find('.sd-slider');
            me.$items = me.$slider.find('.sd-slider-item');

            opts.dots = opts.dots && me.$items.length > 1;
            opts.buttons = opts.buttons && me.$items.length > 1;

            me.initLayout();

            (opts.dots || opts.buttons) && me.bindEvents().setInterval();
    	},

        /**
         * [initLayout 初始化布局]
         * @return {[type]} [description]
         */
        initLayout: function() {
            var me = this,
                opts = me.options,
                $container = $(opts.container),
                $items = me.$items,
                width, height;

            width = opts._width = opts.width || $container.width() || $(window).width();
            height = opts._height = opts.height || $container.height() || $(window).height();

            me.$slider.css({
                width: width,
                height: height
            });

            opts.dots && me.initDots();
            opts.buttons && me.initButtons();

            me.select(opts.current, true);

            return me;
        },

        /**
         * [initDots 初始化Dots]
         * @return {[type]} [description]
         */
    	initDots: function() {
            var me = this,
                opts = me.options,
                html = [],
                $dots;

            $dots = me.$dots = $('<div class="sd-slider-dots"></div>');
            me.$items.each(function() {
                html.push('<div class="sd-slider-dots-item" data-action="dot"></div>');
            });

            $dots.css({
                zIndex: opts.zIndex + 2
            }).html(html.join('\n'));

            me.$slider.append($dots);
            me.selectDots();

            return me;
    	},

        /**
         * [initButtons description]
         * @return {[type]} [description]
         */
    	initButtons: function() {
            var me = this,
                z = me.options.zIndex + 2;

            $.each(['prev', 'next'], function(key, item) {
                item = me['$'+ item] = $('<a href="javascript:void(0)" class="sd-slider-btn-'+ item +'" data-action="'+item+'"></a>').css('z-index', z);
                me.$slider.append(item);
            });

            return me;
    	},

        /**
         * [bindEvents 绑定事件]
         * @return {[type]} [description]
         */
    	bindEvents: function() {
            var me = this,
                opts = me.options,
                $slider = me.$slider,
                $items = me.$items,
                width = opts._width,
                eventList = {
                    prev: function(event, action) {
                        me.animate(action == 'prev' ? 'LTR' : 'RTL');
                    },
                    next: function(event, action) {
                        me.animate(action == 'prev' ? 'LTR' : 'RTL');
                    },
                    dot: function(event) {
                        var $this = $(this),
                            index = $this.index();

                        if($this.hasClass('current')) return;
                        me.select(index)
                    }
                }

            me.__count = 0;

            $slider.on('click', '[data-action]', function(event) {
                var $this = $(this),
                    action = $this.attr('data-action'),
                    date = new Date().getTime();

                if(date - me.__count > opts.duration + 100) {
                    me.__count = date;
                    eventList[action] && eventList[action].call(this, event, action);
                }
            });

            $slider.on('mouseenter', function() {
                $(this).addClass('sd-slider-hover');

                if(opts.autoplay) {
                    clearInterval(me.__timeout);
                    delete me.__timeout;
                }
            }).on('mouseleave', function() {
                $(this).removeClass('sd-slider-hover');
                opts.autoplay && me.setInterval();
            });

            return me;
    	},

        /**
         * [selectDots 选中]
         * @return {[type]} [description]
         */
        selectDots: function() {
            var me = this;
            me.$dots.find('.sd-slider-dots-item').eq(me.options.current || 0).addClass('current').siblings().removeClass('current');
            return me;
        },

        /**
         * [rearrange 重排]
         * @param  {[type]} direction [description]
         * @return {[type]}           [description]
         */
        rearrange: function(direction) {
            var me = this,
                $items = me.$items,
                opts = me.options,
                direction = direction || opts.direction,
                direc = direction === 'RTL',
                zIndex = opts.zIndex + 1,
                width = opts._width;

            opts.current = direc ? opts.next : opts.prev;

            me.updateIndex(direction);

            $items.eq(direc ? opts.prev : opts.next).css({
                left: direc ? 0 - width : width,
                zIndex: zIndex
            });

            $items.eq(direc ? opts.next : opts.prev).css({
                left: direc ? width : 0 - width,
                zIndex: zIndex
            });

            opts.dots && me.selectDots();

            return me;
        },

        /**
         * [animate 执行动画]
         * @param  {[type]} direction [description]
         * @return {[type]}           [description]
         */
        animate: function(direction) {
            var me = this,
                opts = me.options,
                $items = me.$items,
                itemsLen = $items.length,
                current = opts.current,
                width = opts._width,
                duration = opts.duration,
                direc = direction === 'RTL',
                tmp;

            // 仅两张处理
            if(itemsLen === 2) {
                tmp = current === 0 ? 1 : 0;
                $items.eq(tmp).css({
                    left: direc ? width : 0 - width
                }).animate({
                    left: 0
                }, duration);

                $items.eq(current).animate({
                    left: direc ? 0 - width : width
                }, duration);

                opts[direc ? 'next' : 'prev'] = opts.current = tmp;
                me.selectDots();
            }else {
                $.each([{
                    index: opts.current,
                    offset: {
                        RTL: 0 - width,
                        LTR: width
                    }
                },{
                    index: opts.prev,
                    offset: {
                        RTL: 0 - width,
                        LTR: 0
                    }
                },{
                    index: opts.next,
                    offset: {
                        RTL: 0,
                        LTR: width
                    }
                }], function(key, item) {
                    $items.eq(item.index).animate({
                        left: item.offset[direction]
                    }, opts.duration);
                });

                if(me.__timeout__) {
                    window.clearTimeout(me.__timeout__);
                    delete me.__timeout__;
                }
                me.__timeout__ = window.setTimeout(function() {
                    me.rearrange(direction); 
                }, opts.duration);
            }
            return me;    
        },

        /**
         * [updateIndex 更新索引]
         * @return {[type]}           [description]
         */
    	updateIndex: function(direction) {
    		var me = this,
                opts = me.options,
                width = opts._width,
                direction = direction || opts.direction,
                $items = me.$items,
                len = $items.length - 1,
                current = opts.current;

            if(current == 0) {
                opts.prev = len;
                opts.next = current + 1;
            }else if(current == len) {
                opts.prev = current - 1;
                opts.next = 0;
            }else {
                opts.prev = current - 1;
                opts.next = current + 1;
            }

            return me;
    	},

        /**
         * [select 选中某个幻灯片]
         * @param  {[type]}  index  [description]
         * @param  {Boolean} isInit [description]
         * @return {[type]}         [description]
         */
        select: function(index, isInit) {
            var me = this,
                opts   = me.options,
                $items = me.$items,
                width  = opts._width,
                height = opts._height,
                index  = index || 0,
                rtl    = opts.direction == 'RTL',
                _current = opts.current,
                _set   = function() {
                    $items.each(function(key, item) {
                        var $this = $(this),
                            zIndex = (opts.zIndex || 1) + 1,
                            left;

                        if(key == opts.current) {
                            left = 0;
                        } else if(key == opts.prev) {
                            left = 0 - width;
                        } else if(key == opts.next) {
                            left = width;
                        }else {
                            left = 0;
                            zIndex -= 1;
                        }

                        $this.css({
                            width: width,
                            height: height,
                            zIndex: zIndex,
                            left: left
                        });
                    });
                };

            opts.current = index;

            me.updateIndex();

            opts.dots && me.selectDots();

            if(isInit) {
                _set();
                return;
            }

            $items.eq(_current).animate({
                left: rtl ? (0 - width) : width
            }, opts.duration);

            $items.eq(index).css({
                left: rtl ? width : (0 - width),
                index: opts.zIndex + 1
            }).animate({
                left: 0
            }, opts.duration, function() {
                _set();
            });
        },

        /**
         * [setInterval description]
         */
        setInterval: function() {
            var me = this,
                opts = me.options;

            opts.autoplay && ( me.__timeout = setInterval(function() {
                me.animate(opts.direction);
            }, opts.interval) );
        }
    }

    module.exports = Slider;
})(window);

