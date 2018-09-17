

## Fonctionnement

le site collecte les "Jason" de différentes places de marché crypto et cherche parmi les résultats le plus haut et le plus bas prix pour chaque "coin". Exemple pour le LTC:
```javascript
ltc : {
  'bittrex' : 38.23,
  'jubi' : 39.78,
  'chbtc' : 51.8,
}
```
le script va trouver le prix le plus haut (chbtc.com), le plus bas (bittrex), et diviser les deux: 51.8/38.23 = ~1.35 (~35% profit margin) puis pusher les résultats dans le browser. Il va aussi trouver la paire suivante la plus haute, ici chbtc / jubi est la second plus haute et chbtc/bittrex la troisième, jubi/bittrex la quatrième etc ainsi que toutes les combinaisons possibles.

