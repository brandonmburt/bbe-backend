const playerColumns = [
    'id',
    'name',
    'first_name',
    'last_name',
    'pos',
    'team'
];

const draftPickColumns = [
    'user_id',
    'picked_at',
    'pick_number',
    'appearance',
    'first_name',
    'last_name',
    'team',
    'pos',
    'draft',
    'draft_entry',
    'draft_entry_fee',
    'draft_size',
    'draft_total_prizes',
    'tournament_title',
    'tournament',
    'tournament_entry_fee',
    'tournament_total_prizes',
    'tournament_size',
    'draft_pool_title',
    'draft_pool',
    'draft_pool_entry_fee',
    'draft_pool_total_prizes',
    'draft_pool_size',
    'weekly_winner_title',
    'weekly_winner',
    'weekly_winner_entry_fee',
    'weekly_winner_total_prizes',
    'weekly_winner_size'
];

const exposureDataColumns = [
    'user_id',
    'type',
    'draft_spots',
    'drafted_teams',
    'drafted_players',
    'pos_picks_by_round',
    'entries_running_totals',
    'tournaments',
];

const adpDataColumns = [
    'adps',
    'type'
];

const userCreationColumns = [
    'email',
    'password',
    'first_name',
    'last_name'
];

const refreshTokenColumns = [
    'user_id',
    'token',
];

module.exports = {
    playerColumns,
    draftPickColumns,
    exposureDataColumns,
    adpDataColumns,
    userCreationColumns,
    refreshTokenColumns,
}