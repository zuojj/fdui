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

            me.updateIndex(opts.direction).initLayout();
            opts.dots && me.initDots();
            opts.buttons && me.initButtons();
            me.bindEvents().setInterval();
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

            $items.each(function(index, item) {
                var $this = $(this),
                    zIndex = (opts.zIndex || 1) + 1,
                    left;

                if(index == opts.current) {
                    left = 0;
                } else if(index == opts.prev) {
                    left = 0 - width;
                } else if(index == opts.next) {
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
                html.push('<div class="sd-slider-dots-item"></div>');
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
                $slider = me.$slider;

            me.__count = 0;
            $slider.on('click', '[data-action]', function(event) {
                var $this = $(this),
                    action = $this.attr('data-action'),
                    date = new Date().getTime();

                if(date - me.__count > opts.duration) {
                    me.__count = date;
                    me.animate(action == 'prev' ? 'LTR' : 'RTL');
                }
            });

            opts.autoplay && $slider.on('mouseenter', function() {
                clearInterval(me.__timeout);
                delete me.__timeout;
            }).on('mouseleave', function() {
                me.setInterval();
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
                direc = direction === 'RTL',
                width = opts._width;

            opts.current = direc ? opts.next : opts.prev;
            me.updateIndex(direction);
            $items.eq(direc ? opts.prev : opts.next).css({
                left: 0,
                zIndex: opts.zIndex
            });
            $items.eq(direc ? opts.next : opts.prev).css({
                left: direc ? width : 0 - width,
                zIndex: opts.zIndex + 1
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
                width = opts._width,
                list = [{
                    index: opts.current,
                    offset: {
                        RTL: 0 - width,
                        LTR: width
                    }
                },{
                    index: opts.prev,
                    offset: {
                        RTL: 0 - 2 * width,
                        LTR: 0
                    }
                },{
                    index: opts.next,
                    offset: {
                        RTL: 0,
                        LTR: 2 * width
                    }
                }];

            $.each(list, function(key, item) {
                $items.eq(item.index).animate({
                    left: item.offset[direction]
                }, opts.duration);
            });

            me.rearrange(direction); 
            return me;    
        },

        /**
         * [updateIndex 更新索引]
         * @param  {[type]} direction [description]
         * @return {[type]}           [description]
         */
    	updateIndex: function(direction) {
    		var me = this,
                opts = me.options,
                itemsLen = me.$items.length - 1,
                current = opts.current;

            if(current == 0) {
                opts.prev = itemsLen;
                opts.next = current + 1;
            }else if(current == itemsLen) {
                opts.prev = current - 1;
                opts.next = 0;
            }else {
                opts.prev = current - 1;
                opts.next = current + 1;
            }
            return me;
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

