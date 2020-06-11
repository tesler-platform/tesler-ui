#1 Speed measurements
###1.1 Just run `webpack --watch`
first build:\
Version: webpack 4.34.0\
Time: 56742ms
size 3.26 MB

reload info\
Version: webpack 4.34.0\
Time: 16036ms\
Time: 14198ms\

###1.2 Using 'speed-measure-webpack-plugin'
Result\
 
``` 
    SMP  ⏱  
   General output time took 57.1 secs
   
    SMP  ⏱  Plugins
   CopyPlugin took 0.01 secs
   
    SMP  ⏱  Loaders
   ts-loader took 40.32 secs
     module count = 99
   modules with no loaders took 21.14 secs
     module count = 964
   css-loader, and 
   less-loader took 15.99 secs
     module count = 31
   svg-inline-loader took 0.138 secs
     module count = 1
   style-loader, and 
   css-loader, and 
   less-loader took 0.06 secs
     module count = 31
```
Rebuild result:
``` SMP  ⏱  
 General output time took 13.82 secs
 
  SMP  ⏱  Plugins
 CopyPlugin took 0.004 secs
 
  SMP  ⏱  Loaders
 ts-loader took 1.16 secs
   module count = 2
```
#####Выводы:
While rebuild `ts-loader` pretty fast (near 1 sec.). 

#####To check:

* check is it possible to not `emit` all `.d.ts` while rebuild

##### Recommendations
* upgrade `webpack` to 5.0 (is it possible?)
* separate webpack config to common, dev and prod files

#2 Experiments

###2.1 Use webpack dev server
Just adding `webpack dev server` instead `webpack --watch` do not increment rebuild speed.
Furthermore, it disables using `yarn link`.

###2.2 Use webpack development options

Use for dev build:
```{
         loader: 'ts-loader',
         options: {
           transpileOnly: true,
           experimentalWatchApi: true,
         },
       },
```
Measurement result:
First build:
```
 SMP  ⏱  
General output time took 6.8 secs

 SMP  ⏱  Plugins
CopyPlugin took 0.011 secs

 SMP  ⏱  Loaders
modules with no loaders took 4.92 secs
  module count = 964
ts-loader took 3.96 secs
  module count = 103
css-loader, and 
less-loader took 2.061 secs
  module count = 31
svg-inline-loader took 0.384 secs
  module count = 1
style-loader, and 
css-loader, and 
less-loader took 0.046 secs
  module count = 31
```
Rebuild:
```
 SMP  ⏱  
General output time took 2.9 secs

 SMP  ⏱  Plugins
CopyPlugin took 0.004 secs

 SMP  ⏱  Loaders
ts-loader took 0.422 secs
  module count = 1
```
*Conclusion:* 
* Now emits only changed module, but not all `.d.ts` files\

I think it's a huge progress ha-ha
But it doesn't allow to change interfaces. So let's try to...

###2.3 Use ForkTsCheckerWebpackPlugin
It's actually returns type checking only for current project. Not emits .d.ts.
Moreover, `"importsNotUsedAsValues": "preserve"` is required for trigger upon changes in files which contains only interfaces.

###2.4 Upgrade webpack and ts-loader
Attempt to upgrade:
 * webpack from `4.34.0` to `4.43.0`
 * ts-loader from `4.5.0` to `6.2.2`\
 leads to speedup:
 - first build
 ```
 SMP  ⏱  
General output time took 34.27 secs

 SMP  ⏱  Plugins
CopyPlugin took 0.012 secs

 SMP  ⏱  Loaders
ts-loader took 20.15 secs
  module count = 99
modules with no loaders took 9.75 secs
  module count = 964
css-loader, and 
less-loader took 3.85 secs
  module count = 31
svg-inline-loader took 0.197 secs
  module count = 1
style-loader, and 
css-loader, and 
less-loader took 0.059 secs
  module count = 31
```
 - Rebuild (if code changed):
 ``` SMP  ⏱  
    General output time took 4.087 secs
    
     SMP  ⏱  Plugins
    CopyPlugin took 0.003 secs
    
     SMP  ⏱  Loaders
    ts-loader took 1.38 secs
      module count = 4
```
 - Rebuild (if changed file with interfaces):
 ```
<w> [webpack.Progress] 3297ms building
<i> [webpack.Progress] 37ms chunk graph
<i> [webpack.Progress] 16ms advanced chunk optimization
<i> [webpack.Progress] 15ms before module ids
<i> [webpack.Progress] 44ms hashing
<i> [webpack.Progress] 38ms chunk assets processing
<i> [webpack.Progress] 11ms additional chunk assets processing
<w> [webpack.Progress] 1729ms after chunk asset optimization
<w> [webpack.Progress] 10629ms after seal <------------------ still work slow
<i> [webpack.Progress] 68ms emitting
98% after emitting CopyPlugin

 SMP  ⏱  
General output time took 15.92 secs

 SMP  ⏱  Plugins
CopyPlugin took 0.004 secs

 SMP  ⏱  Loaders
ts-loader took 3.29 secs
  module count = 30

```
With this config value of interface in /dist changes, but slooooowly 

##Conclusion
For the first iteration decided to accept config from current webpack.config.js and tsconfig.json
