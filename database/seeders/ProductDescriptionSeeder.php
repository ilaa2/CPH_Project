<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductDescriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $descriptions = [
            // === SAYURAN (Disesuaikan dengan ProductsSeeder) ===
            'Arugula' => 'Arugula dikenal dengan cita rasanya yang sedikit pedas dan getir, memberikan sentuhan gourmet pada setiap salad. Sayuran ini kaya akan nitrat yang dapat membantu meningkatkan aliran darah dan kesehatan jantung.',
            'Bayam' => 'Bayam merupakan sayuran hijau padat nutrisi yang menjadi sumber zat besi, vitamin A, dan vitamin C. Sangat serbaguna untuk diolah menjadi berbagai masakan mulai dari sup hingga smoothie sehat.',
            'Butterhead' => 'Selada Butterhead memiliki tekstur yang sangat lembut dan rasa manis seperti mentega, membuatnya menjadi pilihan favorit untuk sandwich dan salad premium.',
            'Cabai Keriting' => 'Cabai Keriting menawarkan rasa pedas yang khas dan sangat digemari dalam masakan Indonesia. Selain memberikan sensasi pedas yang menggugah selera, cabai ini mengandung capsaicin yang bermanfaat untuk meningkatkan metabolisme.',
            'Dakota' => 'Selada Dakota memiliki daun yang renyah dengan warna hijau segar yang menarik. Keunggulannya terletak pada teksturnya yang tidak mudah layu, menjadikannya pilihan sempurna untuk salad yang tetap segar lebih lama.',
            'Kale' => 'Kale adalah superfood yang sangat populer karena kandungan nutrisinya yang luar biasa padat, termasuk vitamin A, K, dan C, serta kaya akan antioksidan untuk detoksifikasi tubuh.',
            'Kemangi' => 'Kemangi memiliki aroma wangi yang khas, menjadikannya penyedap alami yang menyegarkan untuk berbagai hidangan seperti lalapan dan pepes. Daun kemangi juga kaya akan antioksidan.',
            'Kubis' => 'Kubis adalah sayuran serbaguna dengan tekstur renyah yang kaya akan vitamin C dan serat. Sangat baik untuk diolah menjadi tumisan, sup, hingga fermentasi seperti kimchi.',
            'Lobak Putih' => 'Lobak Putih menawarkan rasa yang renyah dan sedikit pedas, sangat cocok untuk hidangan sup atau soto. Sayuran ini rendah kalori dan mengandung enzim yang membantu melancarkan pencernaan.',
            'Mizuna' => 'Mizuna, atau sawi Jepang, memiliki rasa pedas yang ringan dan tekstur yang renyah, dapat dinikmati mentah sebagai campuran salad yang unik atau dimasak sebentar dalam tumisan.',
            'Mustard' => 'Sawi Mustard memiliki rasa pedas dan tajam yang khas, memberikan karakter kuat pada masakan. Sayuran ini adalah sumber vitamin K, A, dan C yang sangat baik.',
            'Pakcoy' => 'Pakcoy memiliki batang yang renyah dan daun yang lembut dengan rasa manis yang ringan. Keunggulannya adalah waktu memasak yang sangat cepat, ideal untuk hidangan tumis yang praktis dan sehat.',
            'Pakoi' => 'Pakoi, mirip dengan pakcoy, menawarkan batang putih yang renyah dan daun hijau gelap. Sayuran ini kaya akan kalsium dan vitamin, serta memiliki rasa netral yang mudah dipadukan dengan berbagai bumbu.',
            'Paprika' => 'Paprika memberikan rasa manis dan tekstur renyah yang menyegarkan tanpa rasa pedas. Keunggulannya adalah warnanya yang cerah dan kandungan vitamin C yang luar biasa tinggi.',
            'Parsley' => 'Parsley atau peterseli memiliki aroma segar dan rasa herbal yang ringan, menjadikannya garnish populer yang juga berfungsi sebagai penyedap. Tanaman ini kaya akan vitamin K untuk kesehatan tulang.',
            'Red Pak Choy' => 'Red Pak Choy tidak hanya menawarkan kerenyahan, tetapi juga memiliki warna ungu kemerahan yang cantik karena kandungan antosianin, antioksidan kuat yang bermanfaat bagi kesehatan jantung.',
            'Romaine' => 'Selada Romaine terkenal dengan daunnya yang panjang, kokoh, dan sangat renyah, menjadikannya bahan dasar yang sempurna untuk Caesar salad dan merupakan sumber folat yang baik.',
            'Sawi' => 'Sawi hijau adalah sayuran yang sangat populer dan mudah diolah, sering digunakan dalam mie ayam dan tumisan. Keunggulannya adalah harganya yang terjangkau dan kandungan seratnya yang tinggi.',
            'Selada Hijau' => 'Selada Hijau memiliki daun keriting yang renyah dan rasa yang menyegarkan, menjadikannya pilihan klasik untuk segala jenis salad. Sayuran ini rendah kalori dan kaya kandungan air.',
            'Seledri' => 'Seledri memiliki aroma yang khas dan tekstur renyah yang sering digunakan sebagai penambah rasa pada sup. Keunggulannya adalah sangat rendah kalori dan kaya akan senyawa anti-inflamasi.',
            'Tatsoi' => 'Tatsoi memiliki daun hijau gelap berbentuk sendok dengan rasa yang lembut dan sedikit manis. Sayuran ini kaya akan vitamin C dan kalsium, serta dapat diolah dengan sangat cepat.',
            'Wortel' => 'Wortel dikenal luas karena rasanya yang manis dan teksturnya yang renyah. Keunggulan utamanya adalah kandungan beta-karoten yang sangat tinggi untuk mendukung kesehatan mata.',

            // === BUAH (Disesuaikan dengan ProductsSeeder) ===
            'Anggur' => 'Anggur menawarkan rasa manis dan juicy yang menyegarkan. Buah ini kaya akan antioksidan, terutama resveratrol, yang terkenal baik untuk kesehatan jantung dan melawan penuaan dini.',
            'Apel' => 'Apel adalah buah yang renyah dan manis, serta menjadi sumber serat pangan yang sangat baik. Mengonsumsi apel secara teratur dapat membantu menjaga kesehatan pencernaan dan mengontrol berat badan.',
            'Apel Hijau' => 'Apel Hijau memiliki rasa asam yang segar dan tekstur yang lebih renyah. Keunggulannya adalah kandungan gulanya yang cenderung lebih rendah dan seratnya yang tinggi, cocok bagi yang menjaga asupan gula.',
            'Aprikot' => 'Aprikot memiliki daging buah yang lembut dengan rasa manis dan aroma yang wangi. Buah ini merupakan sumber vitamin A dan C yang sangat baik untuk menjaga kesehatan mata dan kekebalan tubuh.',
            'Atemoya' => 'Atemoya adalah buah eksotis dengan daging buah yang lembut, creamy, dan rasa yang sangat manis. Keunggulannya adalah memberikan pengalaman rasa tropis yang unik dan kaya akan vitamin C.',
            'Belimbing' => 'Belimbing memiliki bentuk bintang yang unik saat dipotong dan rasa yang renyah serta menyegarkan. Buah ini rendah kalori namun kaya akan vitamin C, baik untuk menjaga hidrasi dan kesehatan kulit.',
            'Blackberry' => 'Blackberry menawarkan perpaduan rasa manis dan sedikit asam yang kaya. Buah beri ini sarat dengan antioksidan kuat seperti antosianin, sangat baik untuk mendukung kesehatan otak.',
            'Blewah' => 'Blewah sangat populer sebagai minuman takjil karena rasanya yang manis dan menyegarkan. Keunggulannya adalah kandungan airnya yang tinggi sehingga efektif untuk melepaskan dahaga.',
            'Blueberry' => 'Blueberry dijuluki sebagai raja buah antioksidan karena kandungannya yang sangat tinggi. Buah mungil ini terbukti mendukung fungsi otak dan memori, serta menjaga kesehatan jantung.',
            'Buah Naga' => 'Buah Naga memiliki penampilan yang eksotis dengan rasa manis yang ringan. Buah ini kaya akan serat prebiotik yang baik untuk bakteri usus, serta mengandung vitamin C untuk daya tahan tubuh.',
            'Ceri' => 'Ceri memiliki rasa manis yang khas dan warna merah pekat. Buah ini mengandung melatonin alami yang dapat membantu meningkatkan kualitas tidur, serta memiliki sifat anti-inflamasi.',
            'Delima' => 'Delima terkenal dengan biji-bijinya yang juicy dengan rasa manis-asam. Buah ini mengandung antioksidan punicalagin yang sangat kuat untuk melindungi tubuh dari kerusakan sel.',
            'Gooseberry' => 'Gooseberry menawarkan rasa asam yang tajam dan menyegarkan. Keunggulan utamanya adalah kandungan vitamin C yang sangat tinggi, yang berperan penting dalam meningkatkan sistem kekebalan tubuh.',
            'Guava' => 'Jambu Biji (Guava) memiliki rasa manis dan aroma yang kuat. Keunggulan buah ini adalah kandungan vitamin C-nya yang luar biasa tinggi, bahkan melebihi jeruk, serta seratnya yang melimpah.',
            'Jeruk' => 'Jeruk adalah buah yang identik dengan rasa manis, asam, dan segar. Keunggulan utamanya adalah sebagai sumber vitamin C yang populer untuk meningkatkan imunitas dan menjaga kesehatan kulit.',
            'Kismis' => 'Kismis adalah anggur yang dikeringkan, menjadikannya sumber energi yang padat dan praktis. Keunggulannya adalah konsentrasi zat besi dan kalium yang lebih tinggi dibandingkan anggur segar.',
            'Kiwi' => 'Kiwi menawarkan rasa asam-manis yang menyegarkan. Buah ini merupakan bom nutrisi, kaya akan vitamin C, vitamin K, dan serat yang dapat membantu melancarkan pencernaan.',
            'Lemon' => 'Lemon terkenal dengan rasanya yang sangat asam dan aromanya yang segar. Keunggulannya adalah kandungan vitamin C dan asam sitrat yang tinggi, bagus untuk detoksifikasi tubuh.',
            'Mangga' => 'Mangga adalah buah tropis favorit dengan daging buah yang manis, lembut, dan aroma yang sangat harum. Buah ini kaya akan vitamin A dan C, yang penting untuk kesehatan mata dan kulit.',
            'Mangga Hitam' => 'Mangga Hitam adalah varietas mangga yang langka dengan kulit berwarna gelap dan rasa yang sangat manis. Keunggulannya terletak pada keunikan dan kandungan antioksidan antosianin yang lebih tinggi.',
            'Markisa' => 'Markisa memiliki aroma yang sangat eksotis dan rasa asam manis yang khas. Buah ini kaya akan serat dan vitamin A, serta memberikan pengalaman rasa yang unik dan menyegarkan.',
            'Melon' => 'Melon memiliki daging buah yang tebal, manis, dan berair, menjadikannya buah yang sangat menyegarkan. Keunggulannya adalah kandungan kalium dan airnya yang tinggi untuk menjaga keseimbangan cairan tubuh.',
            'Nanas' => 'Nanas menawarkan perpaduan rasa manis dan asam yang tajam. Keunggulan uniknya adalah kandungan enzim bromelain, yang dapat membantu melancarkan pencernaan dan mengurangi peradangan.',
            'Pir' => 'Pir memiliki tekstur renyah atau lembut dengan rasa manis dan kandungan air yang tinggi. Buah ini merupakan sumber serat yang sangat baik untuk kesehatan usus dan memberikan rasa kenyang lebih lama.',
            'Raspberry' => 'Raspberry adalah buah beri dengan rasa manis-asam yang lembut. Buah ini memiliki kandungan serat tertinggi di antara buah beri lainnya, sangat baik untuk kesehatan pencernaan.',
            'Strawberry' => 'Strawberry sangat digemari karena rasanya yang manis dan aromanya yang khas. Buah ini merupakan sumber vitamin C dan mangan yang luar biasa untuk kesehatan jantung dan kulit.',
            'Zaitun' => 'Zaitun adalah buah unik yang menjadi sumber utama minyak zaitun. Buah ini kaya akan lemak tak jenuh tunggal dan vitamin E, yang bermanfaat sebagai antioksidan kuat untuk melindungi sel-sel tubuh.',

            // Nama 'Pokat' diubah menjadi 'Alpukat' agar cocok
            'Alpukat' => 'Alpukat atau Pokat memiliki tekstur creamy seperti mentega. Keunggulan utamanya adalah kandungan lemak tak jenuh tunggal yang sehat untuk jantung, serta kaya akan kalium dan serat.',
        ];

        foreach ($descriptions as $nama => $deskripsi) {
            DB::table('products')->where('nama', $nama)->update(['deskripsi' => $deskripsi]);
        }
    }
}
