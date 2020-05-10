$(document).ready(function () {

    jQuery.fn.clickToggle = function (a, b) {
      var ab = [b, a];

      function cb() {
        ab[this._tog ^= 1].call(this);
      }
      return this.on("click", cb);
    };

    $(".list ul li").append('<input type="checkbox" class="customCheckBox large">');
    $(".list ul li").clickToggle(function () {
      $(this).children("input").prop('checked', true);
      $(this).addClass("checked");
      $(this).removeClass("unchecked");
      var height = $(this).height();
      var y = $(window).scrollTop();
      $('html, body').animate({
        scrollTop: y + height + 16
      }, 200);
    }, function () {
      $(this).children("input").prop('checked', false);
      $(this).removeClass("checked");
      $(this).addClass("unchecked");
      var height = $(this).height();
      var y = $(window).scrollTop();
      $('html, body').animate({
        scrollTop: y - height - 16
      }, 200);
    });

    function numberToPretty(inNum) {
      let wholeNumber = Math.trunc(inNum);
      if (wholeNumber == 0) {
        wholeNumber = "";
      }

      let fraction = inNum % 1;

      let fracRep;
      if (Math.abs(fraction) < 0.0001) {
        fracRep = ''
      } else if (Math.abs(fraction - 1 / 2) < 0.0001) {
        fracRep = " &frac12;";
      } else if (Math.abs(fraction - 1 / 4) < 0.0001) {
        fracRep = " &frac14;";
      } else if (Math.abs(fraction - 3 / 4) < 0.0001) {
        fracRep = " &frac34;";
      } else if (Math.abs(fraction - 1 / 3) < 0.0001) {
        fracRep = " &frac13;";
      } else if (Math.abs(fraction - 2 / 3) < 0.0001) {
        fracRep = " &frac23;";
      } else if (Math.abs(fraction - 1 / 8) < 0.0001) {
        fracRep = " &frac18;";
      } else if (Math.abs(fraction - 3 / 8) < 0.0001) {
        fracRep = " &frac38;";
      } else if (Math.abs(fraction - 5 / 8) < 0.0001) {
        fracRep = " &frac58;";
      } else if (Math.abs(fraction - 7 / 8) < 0.0001) {
        fracRep = " &frac78;";
      } else if (Math.abs(fraction - 1 / 6) < 0.0001) {
        fracRep = " &frac16;";
      } else if (Math.abs(fraction - 5 / 6) < 0.0001) {
        fracRep = " &frac56;";
      } else if (Math.abs(fraction - 1 / 9) < 0.0001) {
        fracRep = " <sup>1</sup>&frasl;<sub>9</sub>";
      } else if (Math.abs(fraction - 2 / 9) < 0.0001) {
        fracRep = " <sup>2</sup>&frasl;<sub>9</sub>";
      } else if (Math.abs(fraction - 4 / 9) < 0.0001) {
        fracRep = " <sup>4</sup>&frasl;<sub>9</sub>";
      } else if (Math.abs(fraction - 5 / 9) < 0.0001) {
        fracRep = " <sup>5</sup>&frasl;<sub>9</sub>";
      } else if (Math.abs(fraction - 7 / 9) < 0.0001) {
        fracRep = " <sup>7</sup>&frasl;<sub>9</sub>";
      } else if (Math.abs(fraction - 8 / 9) < 0.0001) {
        fracRep = " <sup>8</sup>&frasl;<sub>9</sub>";
      } else {
        fracRep = '' + fraction.toFixed(3);
      }

      return wholeNumber + fracRep;
    }

    function calculateIngredients(scale) {
      $('li[itemprop=recipeIngredient]').each(function (index, elem) {
        let quantity = $(elem).data('quantity');
        if (quantity == '') {
          return;
        }

        let unit = $(elem).data('unit');
        let text = $(elem).data('text');

        let info = '' + numberToPretty(scale * quantity) + ' ';
        if (unit != '') {
          info += unit + ' ';
        }
        info += text;

        $(elem).children('p').html(info);
      });
    }

    $('#servings-count').change(function () {
      let servings = $(this).val();
      let baseServings = $(this).data('base-servings');
      let scale = servings / baseServings;

      calculateIngredients(scale);
    });
    calculateIngredients(1);

  });