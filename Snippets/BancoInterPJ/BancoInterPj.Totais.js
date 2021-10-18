// ==UserScript==
// @name         Banco Inter - Totais
// @version      1.0
// @description  Adicionando totalizadores de Créditos e Débitos para o período filtrado
// @author       Pedro Schneider <correaschneider@gmail.com>
// @match        https://contadigitalpj.bancointer.com.br/contacorrente/extratoContaCorrente.jsf
// @icon         https://www.google.com/s2/favicons?domain=bancointer.com.br
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  /**
   * Função para remover os atuais totalizadores
   */
  var removeTotals = function () {
      document.querySelectorAll('fieldset.totals').forEach(function (element) {
          element.remove()
      })
  }

  /**
   * Função para somar os valores de crédito ou débito
   */
  var getTotalValue = function (type) {
      type = type || 'credito'

      var valuesOfType = document.querySelectorAll("#ExtratoFullpage div.justify-content-end div." + type)
      var total = 0
      for (var value of valuesOfType) {
          var subtotal = value.nextElementSibling.querySelector('strong').innerText.replace('.', '').replace(',', '.')
          total += parseFloat(subtotal)
      }

      return total
  }

  /**
   * Função para formatar os valores
   */
  var formatValue = function (value) {
      var totalFormated = value.toFixed(2) + ''
      var matchs
      if (matchs = totalFormated.match(/(\d{1,3})(\d{3})\.(\d{2})/)) {
          matchs.splice(0, 1)
      } else {
          matchs = totalFormated.split('.')
      }

      var cents = matchs.pop()

      totalFormated = matchs.join('.') + ',' + cents

      return totalFormated
  }

  /**
   * Função para adicionar o valor somado no HTML
   */
  var addTotalValue = function (total, label, status) {
      var header = document.querySelector("#ExtratoFullpage > div > div > div > div.px-3.pt-4.pb-2 > div > div.row.align-items-center.justify-content-start.pb-1")

      var totalFormated = formatValue(total)

      header.innerHTML += '<fieldset class="totals col-auto pr-5"><div class="box pl-2"><span class="label">' + label + '</span><div class="balance ' + status + '">R$<span class="bold">&nbsp;' + totalFormated + '</span></div></div></fieldset>'
  }

  /**
   * Função que calcula os valores
   */
  var calcula = function () {
      removeTotals()

      var creditoTotal = getTotalValue('credito')
      addTotalValue(creditoTotal, 'Crédito no período', 'positive')
      var debitoTotal = getTotalValue('debito')
      addTotalValue(debitoTotal, 'Débito no período', 'negative')
  }

  /**
   * Função que cria o Observador para alterar os valores
   */
  var start = function () {
    var targetNode = document
    var configObserve = { attributes: true, childList: true, subtree: true, characterData: true }

    var mutationCallback = function(mutations) {
      mutations.forEach(function (element) {
        if (element.addedNodes[0] && element.addedNodes[0].className === 'list') {
          calcula()
        }
      })
    }

    var observer = new MutationObserver(mutationCallback)
    observer.observe(targetNode, configObserve)
  }

  /**
   * Inicia tudo
   */
  start()
})();