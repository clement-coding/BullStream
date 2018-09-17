

## Fonctionnement

En gros, ça collecte les Jason de différentes place de marché crypto et cherche parmis les résultats le plus haut et le plus bas prix pour chaque coin. Exemple pour le LTC:
```javascript
ltc : {
  'bittrex' : 38.23,
  'jubi' : 39.78,
  'chbtc' : 51.8,
}
```
le script va trouver le prix le plus haut (chbtc.com), le plus bas (bittrex), et diviser les deux: 51.8/38.23 = ~1.35 (~35% profit margin) et pusher les résultats dans le browser. Il va aussi trouver la prochaine plus haute paires, ici chbtc / jubi est le second plus haut et chbtc/bittrex le troisième, jubi/bittrex le quatrième etc et toutes les combinaisons possibles.

"# BullStream" 
# BullStream
