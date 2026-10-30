# Génère des échantillons de voix d'homme (Edge TTS) pour le short.
import asyncio, certifi
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'  # le proxy du sandbox re-signe le TLS
import edge_tts

T = "Tu paies 200 dollars par mois pour une IA ? Sauf que Claude Code fait tout : il code, il débug, il déploie. Abonne-toi pour la suite !"
VOICES = [
    ('1-henri',            'fr-FR-HenriNeural',            '+0%',  '+0Hz'),
    ('2-henri-dynamique',  'fr-FR-HenriNeural',            '+12%', '-2Hz'),
    ('3-remy',             'fr-FR-RemyMultilingualNeural', '+0%',  '+0Hz'),
    ('4-remy-rapide',      'fr-FR-RemyMultilingualNeural', '+15%', '+0Hz'),
    ('5-antoine-quebec',   'fr-CA-AntoineNeural',          '+5%',  '+0Hz'),
    ('6-thierry-quebec',   'fr-CA-ThierryNeural',          '+0%',  '-4Hz'),
    ('7-gerard-belge',     'fr-BE-GerardNeural',           '+0%',  '+0Hz'),
    ('8-fabrice-suisse',   'fr-CH-FabriceNeural',          '+5%',  '+0Hz'),
]

async def main():
    for name, voice, rate, pitch in VOICES:
        await edge_tts.Communicate(T, voice, rate=rate, pitch=pitch).save(f'voices/{name}.mp3')
        print('OK', name)
asyncio.run(main())
