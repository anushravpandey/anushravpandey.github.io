// ==========================================
// MOBILE NAVIGATION
// ==========================================

const menuBtn = document.getElementById("menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    // Close mobile menu after clicking a link
    document.querySelectorAll(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });

    });

}


// ==========================================
// SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL =
    "https://shzjzdlibaeoztjpmpvt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_q2XeJRcr8ertO12rvRj4uA_I0BtHg3x"; // PUT YOUR ACTUAL PUBLISHABLE KEY HERE


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ==========================================
// PORTFOLIO RATING SYSTEM
// ==========================================

const ratingStars =
    document.querySelectorAll("#star-rating button");

const ratingText =
    document.getElementById("rating-text");

const ratingComment =
    document.getElementById("rating-comment");

const submitRating =
    document.getElementById("submit-rating");

const ratingStatus =
    document.getElementById("rating-status");

const averageRating =
    document.getElementById("average-rating");

const averageStars =
    document.getElementById("average-stars");

const ratingCount =
    document.getElementById("rating-count");


let selectedRating = 0;


const ratingMessages = {
    1: "😕 Needs improvement",
    2: "🙂 Could be better",
    3: "👍 Good",
    4: "😊 Very good",
    5: "🤩 Excellent!"
};


// ==========================================
// SELECT STAR RATING
// ==========================================

ratingStars.forEach((star) => {

    star.addEventListener("click", () => {

        selectedRating =
            Number(star.dataset.rating);


        ratingStars.forEach((item) => {

            const itemRating =
                Number(item.dataset.rating);

            item.classList.toggle(
                "active",
                itemRating <= selectedRating
            );

        });


        ratingText.textContent =
            ratingMessages[selectedRating];

    });

});


// ==========================================
// SUBMIT RATING
// ==========================================

if (submitRating) {

    submitRating.addEventListener(
        "click",
        async () => {

            // Check rating
            if (selectedRating === 0) {

                ratingStatus.textContent =
                    "Please select a star rating first.";

                return;
            }


            // Get comment
            const comment =
                ratingComment.value.trim();


            // Disable button while saving
            submitRating.disabled = true;

            ratingStatus.textContent =
                "Saving your rating...";


            // Insert into Supabase
            const { error } =
                await supabaseClient
                    .from("portfolio_ratings")
                    .insert([
                        {
                            rating: selectedRating,
                            comment: comment || null
                        }
                    ]);


            // Check for error
            if (error) {

                console.error(
                    "Rating error:",
                    error
                );


                ratingStatus.textContent =
                    "Could not save your rating. Please try again.";


                submitRating.disabled = false;

                return;
            }


            // Success
            ratingStatus.textContent =
                "⭐ Thank you! Your rating has been saved.";


            // Clear comment
            ratingComment.value = "";


            // Reset rating
            selectedRating = 0;


            ratingStars.forEach((star) => {
                star.classList.remove("active");
            });


            ratingText.textContent =
                "Select a rating";


            submitRating.disabled = false;


            // Update statistics
            loadRatingStatistics();

        }
    );

}


// ==========================================
// LOAD RATING STATISTICS
// ==========================================

async function loadRatingStatistics() {

    const { data, error } =
        await supabaseClient
            .from("portfolio_ratings")
            .select("rating");


    if (error) {

        console.error(
            "Could not load ratings:",
            error
        );

        return;
    }


    // No ratings yet
    if (!data || data.length === 0) {

        if (averageRating) {
            averageRating.textContent = "0.0";
        }

        if (averageStars) {
            averageStars.textContent = "☆☆☆☆☆";
        }

        if (ratingCount) {
            ratingCount.textContent = "0";
        }

        return;
    }


    // Calculate total
    const total =
        data.reduce(
            (sum, item) => sum + item.rating,
            0
        );


    // Calculate average
    const average =
        total / data.length;


    // Show average
    if (averageRating) {

        averageRating.textContent =
            average.toFixed(1);

    }


    // Show number of ratings
    if (ratingCount) {

        ratingCount.textContent =
            data.length;

    }


    // Show stars
    const rounded =
        Math.round(average);


    if (averageStars) {

        averageStars.textContent =
            "★".repeat(rounded) +
            "☆".repeat(5 - rounded);

    }

}


// ==========================================
// LOAD RATINGS WHEN WEBSITE OPENS
// ==========================================

loadRatingStatistics();