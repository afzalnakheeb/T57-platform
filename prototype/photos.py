# Photo bands: one licensed iStock photo under the hero of each page that has no photo of its own.
# PHOTOS holds the alt text and caption for each image (public/img/p/<iStock ID>.webp, 16:9, 1600 and 800 wide).
# PAGES names the photo for each page. Utility pages (help, forms, glossary, leadership, legal) stay without one.
# build.py calls band() for every article and inserts the figure after the hero section.
import re

PHOTOS = {
    '1426834146': ('A loaded container ship crossing open sea.', 'Food crosses borders every day. T57 puts each shipment on one trade record, from quote to payment.'),
    '1306317420': ('A farmer in a galabeya stands in a green field lined with date palms.', 'Producers, buyers, financiers and service providers meet on one verified network.'),
    '1435253289': ('A farmer in a thobe crouches in a drip-irrigated field below desert cliffs, checking his phone.', 'Built in Saudi Arabia, for the people who grow and move the world\'s food.'),
    '2240360614': ('A farmer holds up a small sack of rice in front of a green paddy field.', 'Sellers publish produce, volumes and harvest windows once, and verified buyers find them.'),
    '1185373316': ('A grower hands a crate of fresh vegetables to a buyer with a handshake.', 'Buyers source from verified sellers, with terms, documents and payment on one record.'),
    '2252966040': ('Bulk carriers moored alongside a pier, seen from directly above.', 'Enterprise volumes need one view of every contract, shipment and payment.'),
    '1197644844': ('Workers move dried tea leaves along a processing line.', 'Processors secure inputs on contract and sell finished goods to verified buyers.'),
    '178173788': ('Two pairs of hands pass a handful of paddy rice.', 'Cooperatives pool their members\' harvests and sell as one, on terms everyone can see.'),
    '843053834': ('Gold network lines arc over the lights of Earth at night.', 'One network, many partners: each adds a service to the same trade record.'),
    '1364834632': ('A grain truck drives a dirt road between fields, seen from above.', 'Service providers receive orders with the documents and schedule already attached.'),
    '2157284640': ('Hands lift freshly harvested soybeans from an open sack.', 'Every lot carries its specification, origin and inspection history.'),
    '1557875324': ('Wheat grain pours from a farmer\'s hands into a sack in a ripe wheat field.', 'From the field to the buyer, the record follows the grain.'),
    '2251804015': ('A large heap of golden paddy rice fills a warehouse corner.', 'Stock in the warehouse becomes visible, verifiable and financeable.'),
    '1188850479': ('Saudi riyal banknotes laid in rows.', 'Payments run through licensed partners and release when agreed milestones are met.'),
    '1495516898': ('Ears of wheat resting on US dollar notes on a wooden table.', 'Food prices move every day. T57 shows reference prices from published sources.'),
    '2007507518': ('Rows of leafy greens growing under LED lights in a vertical farm.', 'AI that is built into every step of the trade, not added on top.'),
    '1281959537': ('Earth seen from space at night, with lines connecting its cities.', 'Designed to serve every market from one platform, opening wave by wave.'),
    '485310005': ('A map of the Middle East with lines tracing major air routes.', 'The Gulf sits at the crossroads of food trade between Asia, Africa and Europe.'),
    '1481575916': ('Milk being stirred in a steel tank inside a dairy plant.', 'Processing plants plan output against confirmed contracts, not guesses.'),
    '2236727291': ('A long grain train passes a row of grain silos.', 'Logistics partners quote, book and track each leg on the same record.'),
    '2255087941': ('A freight train curves through farmland beside a highway, seen from a drone.', 'Road, rail and sea legs, tracked end to end.'),
    '2228376734': ('Container ships being loaded by gantry cranes at a port, seen from above.', 'Customs documents and port milestones are tracked on one shared record.'),
    '934538578': ('A hand picks fresh tea leaves in the morning light.', 'Better information for growers means less food lost and higher incomes.'),
    '2207530533': ('Golden-brown dates piled in a metal tray at a market.', 'Saudi dates reach buyers in more than 125 countries.'),
}

# Market pages reuse their market's arrival photo (already in public/img).
MARKET = {
    'sa': ('market-sa', 'Fresh and dried dates piled in trays and baskets at a market.', 'Getting started in Saudi Arabia, with support in Arabic and English from Riyadh.'),
    'uae': ('market-uae', 'Aerial view of a container ship berthed at a port, with containers stacked on the quay.', 'The UAE is one of the founding T57 markets and a hub for re-export.'),
    'in': ('market-in', 'A ripening rice paddy field lined with palm trees.', 'India is one of the founding T57 markets, with deep supply in rice, spices and pulses.'),
    'my': ('market-my', 'Aerial view of a dense tropical palm canopy.', 'Malaysia is one of the founding T57 markets and a bridge to ASEAN.'),
    'tr': ('market-tr', 'A container ship sails the Istanbul Strait at sunrise, beneath a suspension bridge.', 'Türkiye is one of the founding T57 markets, linking Europe and the Gulf.'),
}

PAGES = {
    'who-we-serve': '1306317420', 'why-t57': '1435253289',
    'sellers': '2240360614', 'buyers': '1185373316', 'enterprises': '2252966040', 'food-processors': '1197644844',
    'cooperatives': '178173788', 'collaborators': '843053834', 'service-providers': '1364834632',
    'club-membership': '1306317420', 'rfq-bidding': '2157284640', 'virtual-trade-desk': '1185373316',
    'market-intelligence': '1495516898', 'trade-finance': '2251804015', 'nft-funding': '2251804015',
    'elc-15-minutes': '1188850479', 'escrow-payments': '1188850479', 'alternative-payments': '1281959537',
    'digital-bank': '1188850479', 'document-audit-trail': '2228376734',
    'capabilities': '843053834', 'cap-trade': '1185373316', 'cap-rfq': '2157284640', 'cap-trade-desk': '1306317420',
    'cap-contract-farming': '1557875324', 'cap-tenders': '2251804015', 'cap-traceability': '2157284640',
    'cap-chat-orders': '2240360614', 'cap-trust-payments': '1188850479', 'cap-escrow': '1188850479',
    'cap-wallet': '1188850479', 'cap-elc': '1188850479', 'cap-banking': '1188850479', 'cap-digital-bank': '1188850479',
    'cap-any-currency': '1281959537', 'cap-digital-assets': '2251804015', 'cap-financing': '2251804015',
    'cap-supply-chain-finance': '2236727291', 'cap-fundraising': '1435253289', 'cap-risk': '1495516898',
    'cap-logistics': '1426834146', 'cap-logistics-network': '2255087941', 'cap-tracking': '1364834632',
    'cap-customs': '2228376734', 'cap-intelligence': '1495516898', 'cap-price-index': '1495516898',
    'cap-negotiations': '1185373316', 'cap-equipment-rental': '1364834632', 'cap-hire-expert': '1306317420',
    'ai-native': '2007507518', 'ai-matchmaking': '1185373316', 'ai-negotiations': '1185373316', 'ai-orders': '2240360614',
    'ai-price-index': '1495516898', 'ai-forecasting': '1557875324', 'ai-risk': '2228376734', 'ai-crop-yield': '1557875324',
    'ai-profit-loss': '2251804015', 'ai-crop-planning': '934538578', 'ai-agronomy': '934538578', 'ai-compliance': '2228376734',
    'ai-analytics': '843053834', 'ai-documents': '2252966040',
    'platform': '2007507518', 'platform-trade-cycle': '1426834146', 'platform-domestic': '1364834632',
    'platform-architecture': '843053834', 'platform-roadmap': '1281959537', 'platform-intelligence': '2007507518',
    'platform-blockchain': '843053834', 'platform-security': '1281959537',
    'trust': '1185373316', 'trust-verification': '2157284640', 'trust-kyb': '2252966040', 'trust-kyc': '1435253289',
    'trust-scoring': '1306317420', 'trust-audit-trail': '2228376734', 'trust-documents': '2228376734',
    'trust-security': '843053834', 'trust-data-protection': '1281959537', 'trust-disputes': '1185373316',
    'markets': '485310005', 'markets-global': '1281959537', 'markets-oic': '485310005', 'markets-asean': '934538578',
    'pricing': '2240360614', 'pricing-enterprise': '2252966040', 'pricing-government': '1306317420',
    'resources': '1557875324', 'res-reports': '1495516898', 'res-newsroom': '1426834146', 'res-events': '843053834',
    'partnerships': '843053834', 'partners-technology': '2007507518', 'partners-finance': '2251804015',
    'partners-logistics': '2255087941', 'partners-research': '934538578', 'partners-country': '485310005',
    'about': '1435253289', 'about-impact': '178173788', 'about-food-security': '2240360614', 'about-sdg': '934538578',
    'about-careers': '2007507518', 'contact-offices': '485310005',
}

def _figure(src, sm, alt, cap, istock=''):
    data = f' data-istock="{istock}"' if istock else ''
    return (f'\n  <div class="pband gutter"><div class="wrap"><figure class="pb-frame" data-arrive>'
            f'<img class="photo" src="{src}" srcset="{sm} 800w, {src} 1600w" sizes="(max-width: 900px) 100vw, 1200px" '
            f'alt="{alt}" loading="lazy" decoding="async" width="1600" height="900"{data}>'
            f'<figcaption class="pb-cap">{cap}</figcaption></figure></div></div>')

def band(wid):
    m = re.match(r'mkt-(sa|uae|in|my|tr)-', wid)
    if m:
        name, alt, cap = MARKET[m.group(1)]
        return _figure(f'/img/{name}.jpg', f'/img/{name}-sm.jpg', alt, cap)
    if wid in PAGES:
        i = PAGES[wid]; alt, cap = PHOTOS[i]
        return _figure(f'/img/p/{i}.webp', f'/img/p/{i}-sm.webp', alt, cap, i)
    return ''

def apply(worlds):
    # Insert each page's band right after its hero section.
    def one(a):
        wid = re.search(r'id="([^"]+)"', a.group(0)).group(1)
        b = band(wid)
        return a.group(0) if not b else re.sub(r'(<section class="hero[^"]*".*?</section>)', lambda s: s.group(1) + b, a.group(0), count=1, flags=re.S)
    return re.sub(r'<article class="world".*?</article>', one, worlds, flags=re.S)
