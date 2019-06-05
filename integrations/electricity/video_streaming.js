/**
 * How much carbon emissions are due to videos we watched over the Internet?
 *
 * Several pieces of infrastructure that use electricity (and thus produce
 * carbon emissions) come into play when videos are streamed to a user over the
 * Internet. Emissions associated with the deployment of YouTube for a year are
 * estimated to be approximately 10MtCO2e [1]. We use this number to create a
 * simple carbon model for the footprint of a user's video streaming activity.
 *
 * 10MtCO2e emissions are caused by one year of YouTube deployment where 1
 * billion hours of videos are estimated to be watched each day by YouTube
 * users. A simple calculation tells us that this corresponds to 0.45gCO2e
 * emissions per minute of video watched. We don't include emissions caused by
 * the user's device (mobile phone, computer, tablet...) because we suppose
 * this is already included in the house electricity consumption. We end up
 * with 0.35gCO2e emissions per minute of video watched.
 *
 * [1] Evaluating Sustainable Interaction Design of Digital Services: The Case
 *     of YouTube ( https://dl.acm.org/citation.cfm?id=3300627 )
 */
