// src/utils/graphql.js
export const fetchGraphQL = async (query, variables = {}) => {
  try {
    const response = await fetch(window.RUNTIME_ENV.REACT_APP_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw error;
  }
};

export const queries = {
    gsuRecords: `
      query GetGsuRecords($searchTerm: String, $state: String, $county: String, $limit: Int, $offset: Int) {
        gsuRecords(searchTerm: $searchTerm, state: $state, county: $county, limit: $limit, offset: $offset) {
          Timestamp
          Email_Address
          deed_state
          deed_county
          deed_date
          seller_firstname
          seller_lastname
          seller_county
          seller_state
          seller_administrator_guardian
          seller_administrator_guardian_firstname
          seller_administrator_guardian_lastname
          buyer_firstname
          buyer_lastname
          buyer_county
          buyer_state
          buyer_amount
          buyer_purchased_county_district_lot
          number
          lotnumber_countysection
          buyerpurchased_acres
          deed_link
          Notes
        }
      }
    `,
    
    troyRecords: `
      query GetTroyRecords($searchTerm: String, $enslaved_name: String, $location: String, $limit: Int, $offset: Int) {
        troyRecords(searchTerm: $searchTerm, enslaved_name: $enslaved_name, trans_loc: $location, limit: $limit, offset: $offset) {
          rec_number
          source_pg
          source_fr
          enslaved_name
          enslaved_transrole
          enslaved_color
          enslaved_genagedesc
          enslaved_age
          enslaved_decage
          enslaved_est_birth
          enslaved_est_death
          enslaved_occ
          enslaved_health
          enslaved_unkchild
          enslaved_famno
          enslaved_famrel
          enslaver_business
          enslaver_businessrole
          enslaver_businessloc
          enslaver1_name
          enslaver1_trans_role
          enslaver1_loc
          enslaver2_name
          enslaver2_trans_role
          enslaver2_loc
          enslaver3_name
          enslaver3_trans_role
          enslaver3_loc
          enslaver4_name
          enslaver4_trans_role
          enslaver4_loc
          enslaver5_name
          enslaver5_trans_role
          enslaver5_loc
          enslaver6_name
          enslaver6_trans_role
          enslaver6_loc
          enslaver7_name
          enslaver7_trans_role
          enslaver7_loc
          trans_id
          trans_loc
          trans_type
          trans_record_date
          trans_begin_date
          trans_end_date
          transindv_value
          transgrp_value
          source_author
          source_title
          source_loc
          source_film_no
          url
          extractor
          url_1
          notes
        }
      }
    `
  };