import os
import subprocess

def generate_part(filename, voice, rate, pitch, text):
    filepath = f"assets/drama/{filename}"
    print(f"Generating {filepath}...")
    cmd = [
        "edge-tts",
        "--text", text,
        "--voice", voice,
        f"--rate={rate}",
        f"--pitch={pitch}",
        "--write-media", filepath
    ]
    subprocess.run(cmd, check=True)

os.makedirs("assets/drama", exist_ok=True)

# STORY 1: Roots in the Ash
generate_part("s1_1.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "The scent of charred wood still lingered on the breeze when Elara returned to the lot. A month ago, this had been The Hearth. Then came the night of the fire.")
generate_part("s1_2.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-8Hz", 
              "For weeks, I couldn't get out of bed. The betrayal tasted like ash in my mouth.")
generate_part("s1_3.mp3", "en-IN-NeerjaNeural", "+0%", "+0Hz", 
              "Why rebuild? They don't appreciate it. They don't want it.")
generate_part("s1_4.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "Because if I don't, they win. The hate wins.")
generate_part("s1_5.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "Miss Elara? Standing on the sidewalk was Leo, the eight year old whose brother had lit the match.")
generate_part("s1_6.mp3", "en-IN-NeerjaNeural", "+5%", "+15Hz", 
              "I'm sorry about the center. I brought these. My grandma says sunflowers pull the bad stuff out of the dirt.")
generate_part("s1_7.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "By noon, a few of the neighbors had noticed. By sunset, there were fifteen people in the dirt. We were planting our resilience right through the ashes, straight toward the sun.")

# STORY 2: The Inheritance Trap
generate_part("s2_1.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "My grandmother’s funeral was supposed to be a quiet affair. But when the lawyer read the will, my mother’s name was suspiciously absent. Uncle Vikram stood there, struggling to hide a smug smile.")
generate_part("s2_2.mp3", "en-IN-PrabhatNeural", "+0%", "+0Hz", 
              "It seems Maa felt I was the one truly looking out for the legacy of this house. Of course, you can still come visit on Diwali.")
generate_part("s2_3.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "My uncle thought we were weak. He didn't know that as an architect, I possessed a single, incredibly potent piece of knowledge he had entirely overlooked.")
generate_part("s2_4.mp3", "en-IN-NeerjaExpressiveNeural", "-5%", "-10Hz", 
              "Karma needs a push sometimes.")
generate_part("s2_5.mp3", "en-IN-PrabhatNeural", "+0%", "+5Hz", 
              "Mr. Vikram, five weeks ago, an urban historian filed a petition. The ASI has officially classified the foundations of this courtyard as a Grade-A Heritage Site. This classification prevents any demolition indefinitely.")
generate_part("s2_6.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "Vikram went pale. The ₹40-Crore deal was dead instantly. Sometimes, getting exactly what you steal is the greatest punishment of all.")

# STORY 4: Footprints in the Sand
generate_part("s4_1.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "Nine years. That was the length of the sentence I served before deciding I was worth more. To Aniket, my husband, I was an accessory—a polished trophy he brought out to dinner parties.")
generate_part("s4_2.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "He was careful never to leave physical marks. His weapons were psychological. No one else would deal with someone like you, he would say.")
generate_part("s4_3.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "In Goa, the final thread snapped. I walked to the shoreline. With every wave, my footprints in the wet sand were washed cleanly away. The ocean didn't care. It just kept moving.")
generate_part("s4_4.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "I didn't leave a note. He thrived on arguments, and silence was the one weapon he couldn't deflect. Today, I run a counseling non-profit. The only direction I ever need to look is forward.")

# STORY 5: The Bread of Promise
generate_part("s5_1.mp3", "en-IN-PrabhatNeural", "+0%", "-10Hz", 
              "Thirty years of waking up at 3:00 AM. Flour in my lungs, dough under my nails. I built The Golden Crust from a single brick oven.")
generate_part("s5_2.mp3", "en-IN-PrabhatNeural", "+0%", "-10Hz", 
              "My partner, Rahul, handled the books. One morning, the balance stared back at me in cold, digital indifference: zero rupees. Rahul had disappeared, leaving me with mountains of debt.")
generate_part("s5_3.mp3", "en-IN-PrabhatNeural", "+0%", "-10Hz", 
              "At 58, the profound betrayal had entirely hollowed me out. But when you work with dough, you learn a fundamental truth: it must be knocked down before it can rise.")
generate_part("s5_4.mp3", "en-IN-PrabhatNeural", "+0%", "-10Hz", 
              "I used my last 500 rupees to buy flour. I began baking out of my tiny apartment kitchen. My revenge against Rahul wasn't a lawsuit. It was success. He took the money, but he couldn't steal the magic.")

# STORY 6: The Floating Lantern
generate_part("s6_1.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "The corporate world is notoriously cutthroat. Over six months, my team methodically undermined my reputation at the tech firm I had helped build.")
generate_part("s6_2.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "Emails were altered. Project files vanished. Rumors about my sanity were circulated. I was called into HR and offered a severance package.")
generate_part("s6_3.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "My instinct was warfare. I drafted blistering legal notices. But then, I looked at a floating lantern in the night sky. Up there, the noise of the office didn't exist.")
generate_part("s6_4.mp3", "en-IN-NeerjaExpressiveNeural", "+0%", "-5Hz", 
              "I walked away in silence. I didn't fight them. Two years later, their company collapsed under the weight of the frameworks they didn't truly understand. I am now building something new, something pure. Silence is not weakness. It is power.")

print("All drama parts generated successfully.")
