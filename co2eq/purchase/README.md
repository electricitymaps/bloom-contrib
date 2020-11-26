## An in-depth post about how we measure the carbon footprint of a transaction - and how you can help improve it!

We looked for a way to quantify the carbon footprint of a transaction with as little information possible. We quickly discovered that we shouldn&#39;t reinvent the wheel, as this was a topic that already existed in academia.

At Tomorrow, we believe that climate science shouldn&#39;t be behind paywalls, or stay inside the minds of experts: everyone should be able to know the carbon footprint of everything.

In this post, we explain the process that we go through to make the numbers as accurate as possible, with help from amazing people (among others Thomas Gibon, Louise Laumann Kjær, @MaximeAgez, Richard Wood, @massimopizzol, Jannick Schmidt and @konstantinstadler). At the end of this post, we will also offer insights into where we know the numbers could be improved: this is an opportunity for researchers and experts to give us a hand!

### Input-output tables

To find the carbon impact of a transaction, it became obvious that we should dig into environmentally extended multiregion input-output (EEMRIO) databases. For non domain-experts, these databases look at monetary flows between industries in countries, and link national environmental impact by industries. It becomes a huge matrix, as the production of a product in one country will require inputs from many industries in many other countries, that themselves require inputs from many industries, etc.

### EXIOBASE

There are multiple EEMRIO databases. There is a good overview of the different ones in an [article.](http://folk.ntnu.no/daniemor/pdf/DawkinsMoranEtAl_SwedishFootprint_JCP_2018.pdf) For our work, we chose EXIOBASE for the following reasons:

1. License we can work with: EXIOBASE is free and has a generous license that allows us to share our work publicly
2. Sufficient disaggregation of industries and products
3. Sufficient country coverage
4. Experts in our network know it well

EXIOBASE 3 is the output of multiple European research projects. Its database covers 43 countries and 5 bigger regions, and 200 product or 163 industries. Currently, we use EXIOBASE 3.4, accessible [here](https://www.exiobase.eu/index.php/data-download/exiobase3mon/118-exiobase3-4-iot-2011-pxp).

We used the pymrio package, built and maintained by one of researchers behind EXIOBASE, to calculate the carbon footprint of the consumption of a product in a country, using an iPython Notebook accessible [here](https://github.com/tmrowco/bloom-contrib/blob/master/co2eq/purchase/exiobase/io/carbon_footprint_scopes.ipynb). While EXIOBASE gives us great crude numbers, there are a couple of adjustments to be made to have useful numbers.

### COICOP

The EXIOBASE product category is great for carbon intensive products, for example, there are multiple coal related products. However, the way most companies and humans understand products is a bit different. We decided to use the Classification of Individual Consumption by Purpose (COICOP) taxonomy. Because it&#39;s a UN standard, using COICOP allows us to reuse the work of other researchers and provide a common language if someone wanted to help us. To translate EXIOBASE categories into COICOP categories, we relied on a concordance table shared by Richard Woods (one of the researchers behind EXIOBASE), which is accessible [here](https://github.com/tmrowco/bloom-contrib/blob/master/co2eq/purchase/exiobase/COICOP_EU_ini.csv). This is done [here](https://github.com/tmrowco/bloom-contrib/blob/master/co2eq/purchase/exiobase/prepare.py).

### VAT, producer price and basic price

EXIOBASE is calculated using basic prices, which means removing transport, taxes payable and adding subsidies. That means that if we want to use prices with EXIOBASE, we will need to remove these. This step is often not done in carbon accounting.

In many accounting systems removing VAT is already done, but this is something we will need to check for in the future. Converting producer price to basic price is also a small improvement that is usually not done - we will also do it in the future.

### Consumer Price Indices

EXIOBASE is using 2011 numbers. While there have been efforts to now-cast the database to 2016, we couldn&#39;t find it at the product level (only at industry level). For this reason, we use consumer price indices at least at country level to make sure purchases are converted to 2011 prices. This is done [here](https://github.com/tmrowco/bloom-contrib/blob/master/co2eq/purchase/index.js) at country level and year level using this [data-](https://github.com/tmrowco/bloom-contrib/blob/master/co2eq/purchase/consumerpriceindices.yml) in the future we could do it more accurately at sector level (documented [here](https://github.com/tmrowco/bloom-contrib/issues/392)).

### Exchange rate

Finally, EXIOBASE uses euros, so any purchases done in other currencies will be converted to euros. This is done [here](https://github.com/tmrowco/bloom-contrib/blob/master/co2eq/purchase/index.js) using exchange rates [here](https://github.com/tmrowco/bloom-contrib/blob/master/co2eq/purchase/exchange_rates_2011.json).

### How our data could be improved:

We consider our current model acceptable and in many cases better than what is currently used in corporate carbon accounting.

However, here is how we could see it being improved:

#### EEMRIO

- Use more recent EXIOBASE data, which has more granularity
- Standardize and create Single-country National Accounts Consistent (SNAC) Multi-Regional Input-Output Table (MRIOT) methodology to scale globally (like [Netherlands](https://www.cbs.nl/en-gb/custom/2017/36/footprint-calculations-using-snac-exiobase) and [Sweden](https://www.prince-project.se/how-it-works/))
- Take into account land-use (examples: [Exiobase 3rx](https://figshare.com/articles/EXIOBASE_3rx/8312015), [iLuc from 2.-0 LCA Consultants](https://lca-net.com/clubs/iluc/))

#### EXIOBASE-COICOP conversion

- Create country-by-country EXIOBASE-[COICOP](https://unstats.un.org/unsd/classifications/unsdclassifications/COICOP_2018_-_pre-edited_white_cover_version_-_2018-12-26.pdf) concordance tables
- Create EXIOBASE-COICOP concordance tables for all COICOP categories (currently there are only around 60).

#### VAT and Purchasers price into Basic Price

- Check for VAT
- Convert producer price into basic price

#### CPI

- Add CPI for more countries
- Use CPI at a monthly level instead of annual
- Use Consumer Price Indexes for all COICOP categories instead of national level

Give us a shout or start a PR if you can help us or know somewhere where we could improve!
